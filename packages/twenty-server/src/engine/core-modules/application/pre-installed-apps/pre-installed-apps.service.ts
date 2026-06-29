import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ApplicationInstallService } from 'src/engine/core-modules/application/application-install/application-install.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

@Injectable()
export class PreInstalledAppsService {
  private readonly logger = new Logger(PreInstalledAppsService.name);

  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {}

  // Per-app failures are logged but never block the other installs —
  // `ApplicationInstallService` holds a per-app cache lock so parallel
  // installs are safe.
  async installOnWorkspace(workspaceId: string): Promise<void> {
    const registrations = await this.applicationRegistrationRepository.find({
      where: { isPreInstalled: true },
    });

    if (registrations.length === 0) {
      return;
    }

    await Promise.allSettled(
      registrations.map(async (registration) => {
        try {
          await this.applicationInstallService.installApplication({
            appRegistrationId: registration.id,
            workspaceId,
          });
        } catch (error) {
          this.logger.error(
            `Failed to install pre-installed app "${registration.name}" (${registration.id}) on workspace ${workspaceId}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }),
    );
  }

  async backfillApplicationOnAllWorkspaces(
    applicationRegistrationId: string,
  ): Promise<void> {
    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: applicationRegistrationId, isPreInstalled: true },
    });

    if (!registration) {
      throw new ApplicationException(
        `Pre-installed application registration with id ${applicationRegistrationId} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    const report = await this.workspaceIteratorService.iterate({
      callback: async ({ workspaceId }) => {
        try {
          await this.applicationInstallService.installApplication({
            appRegistrationId: registration.id,
            workspaceId,
          });
        } catch (error) {
          if (
            error instanceof ApplicationException &&
            error.code === ApplicationExceptionCode.APP_ALREADY_INSTALLED
          ) {
            return;
          }

          throw error;
        }
      },
    });

    this.logger.log(
      `Backfilled app "${registration.name}" (${registration.id}): ${report.success.length} succeeded, ${report.fail.length} failed`,
    );
  }
}
