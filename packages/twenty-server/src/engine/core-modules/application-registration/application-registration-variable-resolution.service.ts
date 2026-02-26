import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ApplicationRegistrationEncryptionService } from 'src/engine/core-modules/application-registration/application-registration-encryption.service';
import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

// Resolution order: workspace-level override > server-level default
@Injectable()
export class ApplicationRegistrationVariableResolutionService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    @InjectRepository(ApplicationRegistrationVariableEntity)
    private readonly applicationRegistrationVariableRepository: Repository<ApplicationRegistrationVariableEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly applicationRegistrationEncryption: ApplicationRegistrationEncryptionService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async resolveVariable(
    applicationId: string,
    key: string,
  ): Promise<string | undefined> {
    const workspaceVariable = await this.applicationVariableRepository.findOne({
      where: { applicationId, key },
    });

    if (isDefined(workspaceVariable)) {
      if (workspaceVariable.isSecret) {
        return this.secretEncryptionService.decrypt(workspaceVariable.value);
      }

      return workspaceVariable.value;
    }

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (!isDefined(application?.applicationRegistrationId)) {
      return undefined;
    }

    const serverVariable =
      await this.applicationRegistrationVariableRepository.findOne({
        where: {
          applicationRegistrationId: application.applicationRegistrationId,
          key,
        },
      });

    if (!isDefined(serverVariable)) {
      return undefined;
    }

    return this.applicationRegistrationEncryption.decrypt(
      serverVariable.encryptedValue,
    );
  }

  async resolveAllVariables(
    applicationId: string,
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
    });

    if (isDefined(application?.applicationRegistrationId)) {
      const serverVariables =
        await this.applicationRegistrationVariableRepository.find({
          where: {
            applicationRegistrationId: application.applicationRegistrationId,
          },
        });

      for (const variable of serverVariables) {
        result[variable.key] = this.applicationRegistrationEncryption.decrypt(
          variable.encryptedValue,
        );
      }
    }

    const workspaceVariables = await this.applicationVariableRepository.find({
      where: { applicationId },
    });

    for (const variable of workspaceVariables) {
      if (variable.isSecret) {
        result[variable.key] = this.secretEncryptionService.decrypt(
          variable.value,
        );
      } else {
        result[variable.key] = variable.value;
      }
    }

    return result;
  }
}
