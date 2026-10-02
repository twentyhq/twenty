import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT } from 'src/engine/core-modules/application/application-registration/constants/application-registration-without-manifest-select.constant';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

@Injectable()
export class ApplicationRegistrationLookupService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  async findOneByIdOrThrow({
    applicationRegistrationId,
    ownerWorkspaceId,
  }: {
    applicationRegistrationId: string;
    ownerWorkspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration = await this.applicationRegistrationRepository.findOne({
      select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
      where: { id: applicationRegistrationId, ownerWorkspaceId },
    });

    if (!registration) {
      throw new ApplicationRegistrationException(
        `Application registration with id ${applicationRegistrationId} not found`,
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_NOT_FOUND,
      );
    }

    return registration;
  }

  async findOneByUniversalIdentifierGlobal(
    universalIdentifier: string,
  ): Promise<ApplicationRegistrationEntity | null> {
    return this.applicationRegistrationRepository.findOne({
      where: { universalIdentifier },
    });
  }

  async findOneOwnedByWorkspaceOrThrow({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const applicationRegistration =
      await this.findOneByUniversalIdentifierGlobal(universalIdentifier);

    if (!isDefined(applicationRegistration)) {
      throw new ApplicationException(
        `No registration found for "${universalIdentifier}". Create one first with createApplicationRegistration.`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    this.assertOwnedByWorkspaceOrThrow({
      applicationRegistration,
      workspaceId,
    });

    return applicationRegistration;
  }

  async findOneByIdOwnedByWorkspaceOrThrow({
    applicationRegistrationId,
    workspaceId,
  }: {
    applicationRegistrationId: string;
    workspaceId: string;
  }): Promise<ApplicationRegistrationEntity> {
    const applicationRegistration =
      await this.applicationRegistrationRepository.findOne({
        select: APPLICATION_REGISTRATION_WITHOUT_MANIFEST_SELECT,
        where: { id: applicationRegistrationId },
      });

    if (!isDefined(applicationRegistration)) {
      throw new ApplicationException(
        `No registration found with id "${applicationRegistrationId}".`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    this.assertOwnedByWorkspaceOrThrow({
      applicationRegistration,
      workspaceId,
    });

    return applicationRegistration;
  }

  private assertOwnedByWorkspaceOrThrow({
    applicationRegistration,
    workspaceId,
  }: {
    applicationRegistration: ApplicationRegistrationEntity;
    workspaceId: string;
  }): void {
    if (applicationRegistration.ownerWorkspaceId === workspaceId) {
      return;
    }

    const { universalIdentifier, ownerWorkspaceId } = applicationRegistration;

    throw new ApplicationException(
      !isDefined(ownerWorkspaceId)
        ? `"${universalIdentifier}" is registered on this instance but claimed by no workspace. Claim its ownership before developing on it.`
        : `"${universalIdentifier}" is registered to another workspace. Change the universalIdentifier in your manifest, or transfer the registration from the owning workspace.`,
      ApplicationExceptionCode.FORBIDDEN,
    );
  }
}
