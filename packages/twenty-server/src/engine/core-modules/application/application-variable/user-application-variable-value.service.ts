import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { type WorkspaceMemberApplicationVariablesDTO } from 'src/engine/core-modules/application/application-variable/dtos/workspace-member-application-variables.dto';
import { UserApplicationVariableValueEntity } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.entity';
import { toUserApplicationVariableValues } from 'src/engine/core-modules/application/application-variable/utils/to-user-application-variable-values.util';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { resolveWorkspaceMemberIdForUser } from 'src/engine/core-modules/user/utils/resolve-workspace-member-id-for-user.util';
import { type FlatApplicationVariableMaps } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable-maps.type';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type ApplicationVariableTarget = {
  workspaceId: string;
  applicationId: string;
};

type GetEnvVariablesArgs = ApplicationVariableTarget & {
  userWorkspaceId: string | undefined;
  flatApplicationVariableMaps?: FlatApplicationVariableMaps;
};

@Injectable()
export class UserApplicationVariableValueService {
  constructor(
    @InjectWorkspaceScopedRepository(UserApplicationVariableValueEntity)
    private readonly userApplicationVariableValueRepository: WorkspaceScopedRepository<UserApplicationVariableValueEntity>,
    @InjectWorkspaceScopedRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: WorkspaceScopedRepository<UserWorkspaceEntity>,
    private readonly applicationVariableService: ApplicationVariableEntityService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {}

  async getServerEnvVariables({
    workspaceId,
    applicationId,
    userWorkspaceId,
    flatApplicationVariableMaps,
  }: GetEnvVariablesArgs): Promise<Record<string, string>> {
    const flatUserApplicationVariables =
      await this.findFlatUserApplicationVariables({
        workspaceId,
        applicationId,
        flatApplicationVariableMaps,
      });

    return this.toEnvVariables({
      workspaceId,
      userWorkspaceId,
      flatUserApplicationVariables,
    });
  }

  async getPublicEnvVariables({
    workspaceId,
    applicationId,
    userWorkspaceId,
    flatApplicationVariableMaps,
  }: GetEnvVariablesArgs): Promise<Record<string, string>> {
    const flatUserApplicationVariables = (
      await this.findFlatUserApplicationVariables({
        workspaceId,
        applicationId,
        flatApplicationVariableMaps,
      })
    ).filter(({ isSecret }) => !isSecret);

    return this.toEnvVariables({
      workspaceId,
      userWorkspaceId,
      flatUserApplicationVariables,
    });
  }

  async findUserApplicationVariableValues({
    workspaceId,
    applicationId,
    requestUserWorkspaceId,
  }: ApplicationVariableTarget & {
    requestUserWorkspaceId: string | undefined;
  }): Promise<WorkspaceMemberApplicationVariablesDTO[]> {
    const flatUserApplicationVariables =
      await this.findFlatUserApplicationVariables({
        workspaceId,
        applicationId,
      });

    if (!isNonEmptyArray(flatUserApplicationVariables)) {
      return [];
    }

    const [
      userWorkspaces,
      { userApplicationVariableValueMaps, flatWorkspaceMemberMaps },
    ] = await Promise.all([
      this.userWorkspaceRepository.find(workspaceId, {
        select: { id: true, userId: true },
        where: isDefined(requestUserWorkspaceId)
          ? { id: requestUserWorkspaceId }
          : undefined,
      }),
      this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userApplicationVariableValueMaps',
        'flatWorkspaceMemberMaps',
      ]),
    ]);

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
          variables: toUserApplicationVariableValues({
            flatUserApplicationVariables,
            userApplicationVariableValueMaps,
            userWorkspaceId,
            shouldMaskSecret: isDefined(requestUserWorkspaceId),
            getDisplayValue: ({ value, isSecret }) =>
              this.applicationVariableService.getDisplayValue({
                value,
                workspaceId,
                isSecret,
              }),
          }),
        },
      ];
    });
  }

  async findMyUserApplicationVariableValuesByApplicationId({
    workspaceId,
    applicationIds,
    userWorkspaceId,
  }: {
    workspaceId: string;
    applicationIds: string[];
    userWorkspaceId: string;
  }): Promise<Record<string, UserApplicationVariableValueDTO[]>> {
    const { flatApplicationVariableMaps, userApplicationVariableValueMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationVariableMaps',
        'userApplicationVariableValueMaps',
      ]);

    return Object.fromEntries(
      applicationIds.map((applicationId) => [
        applicationId,
        toUserApplicationVariableValues({
          flatUserApplicationVariables: findFlatEntitiesByApplicationId({
            flatEntityMaps: flatApplicationVariableMaps,
            applicationId,
          }).filter(({ scope }) => scope === 'USER'),
          userApplicationVariableValueMaps,
          userWorkspaceId,
          shouldMaskSecret: true,
          getDisplayValue: ({ value, isSecret }) =>
            this.applicationVariableService.getDisplayValue({
              value,
              workspaceId,
              isSecret,
            }),
        }),
      ]),
    );
  }

  async updateMyUserApplicationVariable({
    workspaceId,
    applicationUniversalIdentifier,
    userWorkspaceId,
    key,
    plainTextValue,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    userWorkspaceId: string;
    key: string;
    plainTextValue: PlaintextString;
  }): Promise<void> {
    const applicationId = await this.findApplicationIdOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const flatApplicationVariable =
      await this.findFlatUserApplicationVariableOrThrow({
        workspaceId,
        applicationId,
        key,
      });

    await this.userApplicationVariableValueRepository.upsert(
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

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'userApplicationVariableValueMaps',
    ]);
  }

  private async toEnvVariables({
    workspaceId,
    userWorkspaceId,
    flatUserApplicationVariables,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    flatUserApplicationVariables: FlatApplicationVariable[];
  }): Promise<Record<string, string>> {
    if (
      !isDefined(userWorkspaceId) ||
      !isNonEmptyArray(flatUserApplicationVariables)
    ) {
      return {};
    }

    const { userApplicationVariableValueMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'userApplicationVariableValueMaps',
      ]);

    return Object.fromEntries(
      toUserApplicationVariableValues({
        flatUserApplicationVariables,
        userApplicationVariableValueMaps,
        userWorkspaceId,
        shouldMaskSecret: false,
        getDisplayValue: ({ value, isSecret }) =>
          this.applicationVariableService.getDisplayValue({
            value,
            workspaceId,
            isSecret,
          }),
      }).map(({ key, value }) => [key, value]),
    );
  }

  private async findApplicationIdOrThrow({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<string> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const flatApplication = findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      applicationUniversalIdentifier,
    );

    if (!isDefined(flatApplication)) {
      throw new ApplicationException(
        `Application ${applicationUniversalIdentifier} not found`,
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return flatApplication.id;
  }

  private async findFlatUserApplicationVariables({
    workspaceId,
    applicationId,
    flatApplicationVariableMaps,
  }: ApplicationVariableTarget & {
    flatApplicationVariableMaps?: FlatApplicationVariableMaps;
  }): Promise<FlatApplicationVariable[]> {
    return (
      await this.applicationVariableService.findFlatApplicationVariables({
        workspaceId,
        applicationId,
        flatApplicationVariableMaps,
      })
    ).filter(({ scope }) => scope === 'USER');
  }

  private async findFlatUserApplicationVariableOrThrow({
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
