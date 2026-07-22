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
    applicationId,
  }: {
    applicationId: string;
  }): Promise<ApplicationEntity> {
    return this.setApplicationStoppedAt({ applicationId, stoppedAt: new Date() });
  }

  async startApplication({
    applicationId,
  }: {
    applicationId: string;
  }): Promise<ApplicationEntity> {
    return this.setApplicationStoppedAt({ applicationId, stoppedAt: null });
  }

  async stopApplicationRegistration({
    applicationRegistrationId,
  }: {
    applicationRegistrationId: string;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    return this.setApplicationRegistrationStoppedAt({
      applicationRegistrationId,
      stoppedAt: new Date(),
    });
  }

  async startApplicationRegistration({
    applicationRegistrationId,
  }: {
    applicationRegistrationId: string;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    return this.setApplicationRegistrationStoppedAt({
      applicationRegistrationId,
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
    applicationId,
    stoppedAt,
  }: {
    applicationId: string;
    stoppedAt: Date | null;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        `Application ${applicationId} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    await this.applicationRepository.update(applicationId, { stoppedAt });

    // The executor reads applications from the workspace cache, so the flag
    // only takes effect once the cached flat application maps are rebuilt.
    await this.workspaceCacheService.invalidateAndRecompute(
      application.workspaceId,
      ['flatApplicationMaps'],
    );

    return { ...application, stoppedAt };
  }

  private async setApplicationRegistrationStoppedAt({
    applicationRegistrationId,
    stoppedAt,
  }: {
    applicationRegistrationId: string;
    stoppedAt: Date | null;
  }): Promise<{
    applicationRegistration: ApplicationRegistrationEntity;
    installedApplicationCount: number;
  }> {
    const applicationRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { id: applicationRegistrationId },
      });

    if (!isDefined(applicationRegistration)) {
      throw new ApplicationRegistrationException(
        `Application registration ${applicationRegistrationId} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    await this.applicationRegistrationRepository.update(
      applicationRegistrationId,
      { stoppedAt },
    );

    const installedApplicationCount = await this.applicationRepository.count({
      where: { applicationRegistrationId },
    });

    return {
      applicationRegistration: { ...applicationRegistration, stoppedAt },
      installedApplicationCount,
    };
  }
}
