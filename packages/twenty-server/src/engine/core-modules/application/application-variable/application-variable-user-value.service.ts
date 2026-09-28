import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { type MyApplicationVariableDTO } from 'src/engine/core-modules/application/application-variable/dtos/my-application-variable.dto';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

type ApplicationVariableTarget = {
  workspaceId: string;
  applicationId: string;
};

@Injectable()
export class ApplicationVariableUserValueService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationVariableUserValueEntity)
    private readonly applicationVariableUserValueRepository: WorkspaceScopedRepository<ApplicationVariableUserValueEntity>,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async findUserValues({
    workspaceId,
    applicationId,
    userWorkspaceId,
  }: ApplicationVariableTarget & {
    userWorkspaceId: string;
  }): Promise<MyApplicationVariableDTO[]> {
    const userFlatApplicationVariables = (
      await this.applicationVariableService.findFlatApplicationVariables({
        workspaceId,
        applicationId,
      })
    ).filter(({ scope }) => scope === 'USER');

    if (!isNonEmptyArray(userFlatApplicationVariables)) {
      return [];
    }

    const userValues = await this.applicationVariableUserValueRepository.find(
      workspaceId,
      {
        where: {
          userWorkspaceId,
          applicationVariableId: In(
            userFlatApplicationVariables.map(({ id }) => id),
          ),
        },
      },
    );

    const userValueByApplicationVariableId = new Map(
      userValues.map(({ applicationVariableId, value }) => [
        applicationVariableId,
        value,
      ]),
    );

    return userFlatApplicationVariables.map(({ id, key, value, isSecret }) => {
      const userValue = userValueByApplicationVariableId.get(id);

      if (isSecret && !isDefined(userValue)) {
        return { key, value: '' };
      }

      return {
        key,
        value: this.applicationVariableService.getDisplayValue({
          value: userValue ?? value,
          workspaceId,
          isSecret,
        }),
      };
    });
  }

  async setUserValue({
    workspaceId,
    applicationId,
    userWorkspaceId,
    key,
    plainTextValue,
  }: ApplicationVariableTarget & {
    userWorkspaceId: string;
    key: string;
    plainTextValue: PlaintextString;
  }): Promise<void> {
    const flatApplicationVariable =
      await this.findUserFlatApplicationVariableOrThrow({
        workspaceId,
        applicationId,
        key,
      });

    await this.applicationVariableUserValueRepository.upsert(
      workspaceId,
      {
        applicationVariableId: flatApplicationVariable.id,
        userWorkspaceId,
        value: this.secretEncryptionService.encryptVersioned(plainTextValue, {
          workspaceId,
        }),
      },
      ['applicationVariableId', 'userWorkspaceId'],
    );
  }

  private async findUserFlatApplicationVariableOrThrow({
    workspaceId,
    applicationId,
    key,
  }: ApplicationVariableTarget & {
    key: string;
  }): Promise<FlatApplicationVariable> {
    const flatApplicationVariable = (
      await this.applicationVariableService.findFlatApplicationVariables({
        workspaceId,
        applicationId,
      })
    ).find((flatApplicationVariable) => flatApplicationVariable.key === key);

    if (!isDefined(flatApplicationVariable)) {
      throw new ApplicationVariableEntityException(
        `Application variable with key ${key} not found`,
        ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
      );
    }

    if (flatApplicationVariable.scope !== 'USER') {
      throw new ApplicationVariableEntityException(
        `Application variable with key ${key} is not a user variable`,
        ApplicationVariableEntityExceptionCode.INVALID_APPLICATION_VARIABLE_INPUT,
      );
    }

    return flatApplicationVariable;
  }
}
