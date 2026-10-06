import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
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
    const userFlatApplicationVariables =
      await this.findUserFlatApplicationVariables({
        workspaceId,
        applicationId,
        flatApplicationVariableMaps,
      });

    return this.toEnvVariables({
      workspaceId,
      userWorkspaceId,
      userFlatApplicationVariables,
    });
  }

  async getPublicEnvVariables({
    workspaceId,
    applicationId,
    userWorkspaceId,
    flatApplicationVariableMaps,
  }: GetEnvVariablesArgs): Promise<Record<string, string>> {
    const userFlatApplicationVariables = (
      await this.findUserFlatApplicationVariables({
        workspaceId,
        applicationId,
        flatApplicationVariableMaps,
      })
    ).filter(({ isSecret }) => !isSecret);

    return this.toEnvVariables({
      workspaceId,
      userWorkspaceId,
      userFlatApplicationVariables,
    });
  }

  async findUserApplicationVariableValues({
    workspaceId,
    applicationId,
    requestUserWorkspaceId,
  }: ApplicationVariableTarget & {
    requestUserWorkspaceId: string | undefined;
  }): Promise<WorkspaceMemberApplicationVariablesDTO[]> {
    const userFlatApplicationVariables =
      await this.findUserFlatApplicationVariables({
        workspaceId,
        applicationId,
      });

    if (!isNonEmptyArray(userFlatApplicationVariables)) {
      return [];
    }

    const [userWorkspaces, userValues, { flatWorkspaceMemberMaps }] =
      await Promise.all([
        this.userWorkspaceRepository.find(workspaceId, {
          select: { id: true, userId: true },
          where: isDefined(requestUserWorkspaceId)
            ? { id: requestUserWorkspaceId }
            : undefined,
        }),
        this.userApplicationVariableValueRepository.find(workspaceId, {
          select: {
            userWorkspaceId: true,
            applicationVariableId: true,
            value: true,
          },
          where: {
            applicationVariableId: In(
              userFlatApplicationVariables.map(({ id }) => id),
            ),
            ...(isDefined(requestUserWorkspaceId)
              ? { userWorkspaceId: requestUserWorkspaceId }
              : {}),
          },
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]),
      ]);

    const userValuesByUserWorkspaceId = groupBy(userValues, 'userWorkspaceId');

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
            userFlatApplicationVariables,
            userValues: userValuesByUserWorkspaceId[userWorkspaceId] ?? [],
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

  async updateMyApplicationUserVariable({
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
      await this.findUserFlatApplicationVariableOrThrow({
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
  }

  private async toEnvVariables({
    workspaceId,
    userWorkspaceId,
    userFlatApplicationVariables,
  }: {
    workspaceId: string;
    userWorkspaceId: string | undefined;
    userFlatApplicationVariables: FlatApplicationVariable[];
  }): Promise<Record<string, string>> {
    if (!isNonEmptyArray(userFlatApplicationVariables)) {
      return {};
    }

    const userValues = isDefined(userWorkspaceId)
      ? await this.findUserValues({
          workspaceId,
          userWorkspaceId,
          userFlatApplicationVariables,
        })
      : [];

    return Object.fromEntries(
      toUserApplicationVariableValues({
        userFlatApplicationVariables,
        userValues,
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

  private async findUserValues({
    workspaceId,
    userWorkspaceId,
    userFlatApplicationVariables,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    userFlatApplicationVariables: FlatApplicationVariable[];
  }): Promise<
    Pick<
      UserApplicationVariableValueEntity,
      'applicationVariableId' | 'value'
    >[]
  > {
    return this.userApplicationVariableValueRepository.find(workspaceId, {
      select: { applicationVariableId: true, value: true },
      where: {
        userWorkspaceId,
        applicationVariableId: In(
          userFlatApplicationVariables.map(({ id }) => id),
        ),
      },
    });
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

  private async findUserFlatApplicationVariables({
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
