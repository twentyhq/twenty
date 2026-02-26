import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

@Injectable()
export class ApplicationRegistrationIdentifierGuardService {
  constructor(
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {}

  // Validates that a universalIdentifier being created/used by an application
  // is not claimed by a different ApplicationRegistration.
  // Grandfather policy: applications without applicationRegistrationId are not checked.
  async validateUniversalIdentifierOwnership(params: {
    universalIdentifier: string;
    applicationId: string;
  }): Promise<{ isValid: boolean; errorMessage?: string }> {
    const application = await this.applicationRepository.findOne({
      where: { id: params.applicationId },
    });

    if (!isDefined(application?.applicationRegistrationId)) {
      return { isValid: true };
    }

    const ownerRegistration =
      await this.applicationRegistrationRepository.findOne({
        where: { universalIdentifier: params.universalIdentifier },
      });

    if (!isDefined(ownerRegistration)) {
      return { isValid: true };
    }

    if (ownerRegistration.id !== application.applicationRegistrationId) {
      return {
        isValid: false,
        errorMessage:
          `Universal identifier '${params.universalIdentifier}' is claimed by ` +
          `application registration '${ownerRegistration.name}' (${ownerRegistration.id}), ` +
          `but application '${application.name}' is linked to a different registration`,
      };
    }

    return { isValid: true };
  }
}
