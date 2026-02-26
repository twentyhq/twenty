import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Injectable()
export class AppRegistrationIdentifierGuardService {
  constructor(
    @InjectRepository(AppRegistrationEntity)
    private readonly appRegistrationRepository: Repository<AppRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  // Validates that a universalIdentifier being created/used by an application
  // is not claimed by a different AppRegistration.
  // Grandfather policy: applications without appRegistrationId are not checked.
  async validateUniversalIdentifierOwnership(params: {
    universalIdentifier: string;
    applicationId: string;
  }): Promise<{ isValid: boolean; errorMessage?: string }> {
    const application = await this.applicationRepository.findOne({
      where: { id: params.applicationId },
    });

    if (!isDefined(application?.appRegistrationId)) {
      return { isValid: true };
    }

    const ownerRegistration = await this.appRegistrationRepository.findOne({
      where: { universalIdentifier: params.universalIdentifier },
    });

    if (!isDefined(ownerRegistration)) {
      return { isValid: true };
    }

    if (ownerRegistration.id !== application.appRegistrationId) {
      return {
        isValid: false,
        errorMessage:
          `Universal identifier '${params.universalIdentifier}' is claimed by ` +
          `app registration '${ownerRegistration.name}' (${ownerRegistration.id}), ` +
          `but application '${application.name}' is linked to a different registration`,
      };
    }

    return { isValid: true };
  }
}
