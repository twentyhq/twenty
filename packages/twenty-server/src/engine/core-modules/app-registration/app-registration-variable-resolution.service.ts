import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AppRegistrationEncryptionService } from 'src/engine/core-modules/app-registration/app-registration-encryption.service';
import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

// Resolution order: workspace-level override > server-level default
@Injectable()
export class AppRegistrationVariableResolutionService {
  constructor(
    @InjectRepository(ApplicationVariableEntity)
    private readonly applicationVariableRepository: Repository<ApplicationVariableEntity>,
    @InjectRepository(AppRegistrationVariableEntity)
    private readonly appRegistrationVariableRepository: Repository<AppRegistrationVariableEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly appRegistrationEncryption: AppRegistrationEncryptionService,
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

    if (!isDefined(application?.appRegistrationId)) {
      return undefined;
    }

    const serverVariable = await this.appRegistrationVariableRepository.findOne(
      {
        where: {
          appRegistrationId: application.appRegistrationId,
          key,
        },
      },
    );

    if (!isDefined(serverVariable)) {
      return undefined;
    }

    return this.appRegistrationEncryption.decrypt(
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

    if (isDefined(application?.appRegistrationId)) {
      const serverVariables = await this.appRegistrationVariableRepository.find(
        {
          where: { appRegistrationId: application.appRegistrationId },
        },
      );

      for (const variable of serverVariables) {
        result[variable.key] = this.appRegistrationEncryption.decrypt(
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
