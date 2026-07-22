import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Emergency kill switch for applications DDoSing the server or the database.
// Workspace level: stops one installed application. Server level: stops every
// application installed from an application registration, in all workspaces.
@Injectable()
export class ApplicationStopService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async stopApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<ApplicationEntity> {
    return this.setApplicationStoppedAt({
      workspaceId,
      applicationUniversalIdentifier,
      stoppedAt: new Date(),
    });
  }

  async startApplication({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<ApplicationEntity> {
    return this.setApplicationStoppedAt({
      workspaceId,
      applicationUniversalIdentifier,
      stoppedAt: null,
    });
  }

  async stopApplicationRegistration({
    applicationRegistrationUniversalIdentifier,
  }: {
    applicationRegistrationUniversalIdentifier: string;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    return this.setApplicationRegistrationStoppedAt({
      applicationRegistrationUniversalIdentifier,
      stoppedAt: new Date(),
    });
  }

  async startApplicationRegistration({
    applicationRegistrationUniversalIdentifier,
  }: {
    applicationRegistrationUniversalIdentifier: string;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    return this.setApplicationRegistrationStoppedAt({
      applicationRegistrationUniversalIdentifier,
      stoppedAt: null,
    });
  }

  async isApplicationRegistrationStopped(
    applicationRegistrationId: string,
  ): Promise<boolean> {
    const stoppedApplicationRegistrationCount =
      await this.applicationRegistrationRepository.count({
        where: {
          id: applicationRegistrationId,
          stoppedAt: Not(IsNull()),
        },
      });

    return stoppedApplicationRegistrationCount > 0;
  }

  private async setApplicationStoppedAt({
    workspaceId,
    applicationUniversalIdentifier,
    stoppedAt,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    stoppedAt: Date | null;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({
      where: {
        workspaceId,
        universalIdentifier: applicationUniversalIdentifier,
      },
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} not found in workspace ${workspaceId}`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    await this.applicationRepository.update(application.id, { stoppedAt });

    // The executor reads applications from the workspace cache, so the flag
    // only takes effect once the cached flat application maps are rebuilt.
    await this.workspaceCacheService.invalidateAndRecompute(
      application.workspaceId,
      ['flatApplicationMaps'],
    );

    return { ...application, stoppedAt };
  }

  private async setApplicationRegistrationStoppedAt({
    applicationRegistrationUniversalIdentifier,
    stoppedAt,
  }: {
    applicationRegistrationUniversalIdentifier: string;
    stoppedAt: Date | null;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    const applicationRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: {
          universalIdentifier: applicationRegistrationUniversalIdentifier,
        },
      });

    if (!isDefined(applicationRegistration)) {
      throw new ApplicationRegistrationException(
        `Application registration ${applicationRegistrationUniversalIdentifier} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    await this.applicationRegistrationRepository.update(
      applicationRegistration.id,
      { stoppedAt },
    );

    const installedApplicationCount = await this.applicationRepository.count({
      where: { applicationRegistrationId: applicationRegistration.id },
    });

    return {
      applicationRegistration: { ...applicationRegistration, stoppedAt },
      installedApplicationCount,
    };
  }
}
