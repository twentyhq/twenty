import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { type ApplicationVariableUserValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/application-variable-user-value.dto';
import { type WorkspaceMemberApplicationVariablesDTO } from 'src/engine/core-modules/application/application-variable/dtos/workspace-member-application-variables.dto';
import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { resolveWorkspaceMemberIdForUser } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/resolve-workspace-member-id-for-user.util';
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

type UserValue = Pick<
  ApplicationVariableUserValueEntity,
  'applicationVariableId' | 'value'
>;

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

  async findMyApplicationVariables({
    workspaceId,
    applicationUniversalIdentifier,
    userWorkspaceId,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    userWorkspaceId: string;
  }): Promise<ApplicationVariableUserValueDTO[]> {
    const applicationId = await this.findApplicationIdOrThrow({
      workspaceId,
      applicationUniversalIdentifier,
    });

    const userFlatApplicationVariables =
      await this.findUserFlatApplicationVariables({
        workspaceId,
        applicationId,
      });

    if (!isNonEmptyArray(userFlatApplicationVariables)) {
      return [];
    }

    const userValues = await this.applicationVariableUserValueRepository.find(
      workspaceId,
      {
        select: { applicationVariableId: true, value: true },
        where: {
          userWorkspaceId,
          applicationVariableId: In(
            userFlatApplicationVariables.map(({ id }) => id),
          ),
        },
      },
    );

    return this.toApplicationVariableUserValues({
      userFlatApplicationVariables,
      userValues,
      workspaceId,
      shouldMaskSecret: true,
    });
  }

  async findApplicationVariableUserValues({
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
        this.applicationVariableUserValueRepository.find(workspaceId, {
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
          variables: this.toApplicationVariableUserValues({
            userFlatApplicationVariables,
            userValues: userValuesByUserWorkspaceId[userWorkspaceId] ?? [],
            workspaceId,
            shouldMaskSecret: isDefined(requestUserWorkspaceId),
          }),
        },
      ];
    });
  }

  async updateMyApplicationVariable({
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

  private toApplicationVariableUserValues({
    userFlatApplicationVariables,
    userValues,
    workspaceId,
    shouldMaskSecret,
  }: {
    userFlatApplicationVariables: FlatApplicationVariable[];
    userValues: UserValue[];
    workspaceId: string;
    shouldMaskSecret: boolean;
  }): ApplicationVariableUserValueDTO[] {
    const userValueByApplicationVariableId = new Map(
      userValues.map(({ applicationVariableId, value }) => [
        applicationVariableId,
        value,
      ]),
    );

    return userFlatApplicationVariables.map((flatApplicationVariable) => ({
      key: flatApplicationVariable.key,
      label: flatApplicationVariable.label,
      description: flatApplicationVariable.description,
      type: flatApplicationVariable.type,
      options: flatApplicationVariable.options,
      isSecret: flatApplicationVariable.isSecret,
      isRequired: flatApplicationVariable.isRequired,
      isDeprecated: flatApplicationVariable.isDeprecated,
      value: this.applicationVariableService.getDisplayValue({
        value:
          userValueByApplicationVariableId.get(flatApplicationVariable.id) ??
          null,
        workspaceId,
        isSecret: flatApplicationVariable.isSecret && shouldMaskSecret,
      }),
    }));
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
  }: ApplicationVariableTarget): Promise<FlatApplicationVariable[]> {
    return (
      await this.applicationVariableService.findFlatApplicationVariables({
        workspaceId,
        applicationId,
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
