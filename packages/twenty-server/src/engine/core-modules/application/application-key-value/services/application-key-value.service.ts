import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { IsNull, Repository } from 'typeorm';

import { type AppKeyValue } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { AppKeyValueScope } from 'src/engine/core-modules/application/application-key-value/enums/app-key-value-scope.enum';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';

@Injectable()
export class ApplicationKeyValueService {
  constructor(
    @InjectRepository(KeyValuePairEntity)
    private readonly keyValuePairRepository: Repository<KeyValuePairEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ApplicationRegistrationEntity)
    private readonly applicationRegistrationRepository: Repository<ApplicationRegistrationEntity>,
  ) {}

  async get({
    application,
    workspaceId,
    key,
    scope,
  }: {
    application: FlatApplication;
    workspaceId: string;
    key: string;
    scope: AppKeyValueScope;
  }): Promise<AppKeyValue | null> {
    const scopedWhere =
      scope === AppKeyValueScope.GLOBAL
        ? {
            applicationId: await this.resolveGlobalApplicationId(application),
            workspaceId: IsNull(),
          }
        : {
            applicationId: application.id,
            workspaceId,
          };

    const entry = await this.keyValuePairRepository.findOne({
      where: {
        key,
        type: KeyValuePairType.APPLICATION_VARIABLE,
        ...scopedWhere,
      },
    });

    if (!isDefined(entry)) {
      return null;
    }

    return { key, value: entry.value, scope };
  }

  async set({
    application,
    workspaceId,
    key,
    value,
    scope,
  }: {
    application: FlatApplication;
    workspaceId: string;
    key: string;
    value: unknown;
    scope: AppKeyValueScope;
  }): Promise<AppKeyValue> {
    if (scope === AppKeyValueScope.GLOBAL) {
      return this.claimGlobalKey({ application, workspaceId, key, value });
    }

    await this.keyValuePairRepository.upsert(
      {
        key,
        value: value as KeyValuePairEntity['value'],
        applicationId: application.id,
        workspaceId,
        userId: null,
        type: KeyValuePairType.APPLICATION_VARIABLE,
      },
      {
        conflictPaths: ['key', 'applicationId'],
        indexPredicate:
          '"applicationId" IS NOT NULL AND "workspaceId" IS NOT NULL',
      },
    );

    return { key, value, scope };
  }

  async delete({
    application,
    workspaceId,
    key,
    scope,
  }: {
    application: FlatApplication;
    workspaceId: string;
    key: string;
    scope: AppKeyValueScope;
  }): Promise<boolean> {
    if (scope === AppKeyValueScope.GLOBAL) {
      const result = await this.keyValuePairRepository
        .createQueryBuilder()
        .delete()
        .where('"key" = :key', { key })
        .andWhere('"applicationId" = :applicationId', {
          applicationId: await this.resolveGlobalApplicationId(application),
        })
        .andWhere('"workspaceId" IS NULL')
        .andWhere('"type" = :type', {
          type: KeyValuePairType.APPLICATION_VARIABLE,
        })
        .andWhere('"value" = :value::jsonb', {
          value: JSON.stringify(workspaceId),
        })
        .execute();

      return (result.affected ?? 0) > 0;
    }

    const result = await this.keyValuePairRepository.delete({
      key,
      applicationId: application.id,
      workspaceId,
      type: KeyValuePairType.APPLICATION_VARIABLE,
    });

    return (result.affected ?? 0) > 0;
  }

  private async claimGlobalKey({
    application,
    workspaceId,
    key,
    value,
  }: {
    application: FlatApplication;
    workspaceId: string;
    key: string;
    value: unknown;
  }): Promise<AppKeyValue> {
    if (isDefined(value) && value !== workspaceId) {
      throw new ApplicationException(
        'Global keys hold the claiming workspaceId: omit the value or pass your own workspaceId',
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`Global keys can only be claimed for your own workspace.`,
        },
      );
    }

    const globalApplicationId =
      await this.resolveGlobalApplicationId(application);
    const claimValue: unknown = workspaceId;

    await this.keyValuePairRepository
      .createQueryBuilder()
      .insert()
      .into(KeyValuePairEntity)
      .values({
        key,
        value: claimValue as KeyValuePairEntity['value'],
        applicationId: globalApplicationId,
        workspaceId: null,
        userId: null,
        type: KeyValuePairType.APPLICATION_VARIABLE,
      })
      .orIgnore()
      .execute();

    const entry = await this.keyValuePairRepository.findOne({
      where: {
        key,
        applicationId: globalApplicationId,
        workspaceId: IsNull(),
        type: KeyValuePairType.APPLICATION_VARIABLE,
      },
    });

    if (!isDefined(entry)) {
      throw new ApplicationException(
        `Could not persist global key "${key}"`,
        ApplicationExceptionCode.KEY_VALUE_PERSISTENCE_FAILED,
      );
    }

    const claimedWorkspaceId: unknown = entry.value;

    if (claimedWorkspaceId !== workspaceId) {
      throw new ApplicationException(
        `Global key "${key}" is already claimed by another workspace`,
        ApplicationExceptionCode.FORBIDDEN,
        {
          userFriendlyMessage: msg`This global key is already claimed by another workspace.`,
        },
      );
    }

    return { key, value: entry.value, scope: AppKeyValueScope.GLOBAL };
  }

  // GLOBAL entries of a registered application all live under the registration owner workspace's install
  private async resolveGlobalApplicationId(
    application: FlatApplication,
  ): Promise<string> {
    if (!isDefined(application.applicationRegistrationId)) {
      return application.id;
    }

    const registration = await this.applicationRegistrationRepository.findOne({
      where: { id: application.applicationRegistrationId },
    });

    if (!isDefined(registration) || !isDefined(registration.ownerWorkspaceId)) {
      return application.id;
    }

    if (registration.ownerWorkspaceId === application.workspaceId) {
      return application.id;
    }

    const ownerInstall = await this.applicationRepository.findOne({
      where: {
        applicationRegistrationId: registration.id,
        workspaceId: registration.ownerWorkspaceId,
      },
    });

    if (!isDefined(ownerInstall)) {
      throw new ApplicationException(
        `Global keys are unavailable for application ${application.id}: the registration owner workspace has no install`,
        ApplicationExceptionCode.APP_NOT_INSTALLED,
        {
          userFriendlyMessage: msg`Global keys require the application publisher workspace to have the application installed.`,
        },
      );
    }

    return ownerInstall.id;
  }
}
