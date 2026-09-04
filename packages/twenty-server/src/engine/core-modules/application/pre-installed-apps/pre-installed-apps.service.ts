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
import {
  INSTALL_APPLICATIONS_JOB_NAME,
  type InstallApplicationsJobApplication,
  type InstallApplicationsJobData,
} from 'src/engine/core-modules/application/jobs/install-applications.job-constants';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

@Injectable()
export class PreInstalledAppsService {
  private readonly logger = new Logger(PreInstalledAppsService.name);

  constructor(
    private readonly applicationInstallService: ApplicationInstallService,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectMessageQueue(MessageQueue.workspaceQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async enqueueInstallOnWorkspace(workspaceId: string): Promise<void> {
    const applications = await this.findPreInstalledApplications();

    if (applications.length === 0) {
      return;
    }

    await this.messageQueueService.add<InstallApplicationsJobData>(
      INSTALL_APPLICATIONS_JOB_NAME,
      { applications, workspaceId },
      {
        id: `${INSTALL_APPLICATIONS_JOB_NAME}-pre-installed-${workspaceId}`,
        retryLimit: 0,
      },
    );
  }

  async installOnWorkspace(workspaceId: string): Promise<void> {
    const applications = await this.findPreInstalledApplications();

    if (applications.length === 0) {
      return;
    }

    await this.applicationInstallService.installApplications({
      applications,
      workspaceId,
    });
  }

  private async findPreInstalledApplications(): Promise<
    InstallApplicationsJobApplication[]
  > {
    const registrations = await this.applicationRegistrationRepository.find({
      where: { isPreInstalled: true },
    });

    return registrations.map((registration) => ({
      appRegistrationId: registration.id,
      universalIdentifier: registration.universalIdentifier,
    }));
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
