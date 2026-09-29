import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { type ApplicationVariableUserValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable-user-value.dto';
import { type MyApplicationVariableDTO } from 'src/engine/core-modules/application/application-variable/dtos/my-application-variable.dto';
import { resolveWorkspaceMemberIdForUser } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/resolve-workspace-member-id-for-user.util';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ApplicationVariableTarget = {
  workspaceId: string;
  applicationId: string;
};

@Injectable()
export class ApplicationVariableUserValueService {
  constructor(
    @InjectWorkspaceScopedRepository(ApplicationVariableUserValueEntity)
    private readonly applicationVariableUserValueRepository: WorkspaceScopedRepository<ApplicationVariableUserValueEntity>,
    @InjectWorkspaceScopedRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: WorkspaceScopedRepository<UserWorkspaceEntity>,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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

    return userFlatApplicationVariables.map((flatApplicationVariable) => ({
      key: flatApplicationVariable.key,
      value: this.resolveValue({
        flatApplicationVariable,
        userValue: userValueByApplicationVariableId.get(
          flatApplicationVariable.id,
        ),
        workspaceId,
        shouldMaskSecret: true,
      }),
    }));
  }

  async findAllUserValues({
    workspaceId,
    applicationId,
    key,
    requestUserWorkspaceId,
  }: ApplicationVariableTarget & {
    key: string;
    requestUserWorkspaceId: string | undefined;
  }): Promise<ApplicationVariableUserValueDTO[]> {
    const flatApplicationVariable =
      await this.findUserFlatApplicationVariableOrThrow({
        workspaceId,
        applicationId,
        key,
      });

    const [userWorkspaces, userValues, { flatWorkspaceMemberMaps }] =
      await Promise.all([
        this.userWorkspaceRepository.find(workspaceId, {
          select: { id: true, userId: true },
          where: isDefined(requestUserWorkspaceId)
            ? { id: requestUserWorkspaceId }
            : undefined,
        }),
        this.applicationVariableUserValueRepository.find(workspaceId, {
          select: { userWorkspaceId: true, value: true },
          where: {
            applicationVariableId: flatApplicationVariable.id,
            ...(isDefined(requestUserWorkspaceId)
              ? { userWorkspaceId: requestUserWorkspaceId }
              : {}),
          },
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]),
      ]);

    const userValueByUserWorkspaceId = new Map(
      userValues.map(({ userWorkspaceId, value }) => [userWorkspaceId, value]),
    );

    return userWorkspaces.flatMap(({ id: userWorkspaceId, userId }) => {
      const workspaceMemberId = resolveWorkspaceMemberIdForUser({
        userId,
        flatWorkspaceMemberMaps,
      });

      if (!isDefined(workspaceMemberId)) {
        return [];
      }

      return [
        {
          userWorkspaceId,
          workspaceMemberId,
          value: this.resolveValue({
            flatApplicationVariable,
            userValue: userValueByUserWorkspaceId.get(userWorkspaceId),
            workspaceId,
            shouldMaskSecret: isDefined(requestUserWorkspaceId),
          }),
        },
      ];
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

  private resolveValue({
    flatApplicationVariable: { value, isSecret },
    userValue,
    workspaceId,
    shouldMaskSecret,
  }: {
    flatApplicationVariable: Pick<
      FlatApplicationVariable,
      'value' | 'isSecret'
    >;
    userValue: EncryptedString | undefined;
    workspaceId: string;
    shouldMaskSecret: boolean;
  }): string {
    if (isSecret && !isDefined(userValue)) {
      return '';
    }

    return this.applicationVariableService.getDisplayValue({
      value: userValue ?? value,
      workspaceId,
      isSecret: isSecret && shouldMaskSecret,
    });
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
