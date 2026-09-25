import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getRequest } from 'src/utils/extract-request';

// Sessions and API keys keep workspace-wide reach behind their permission
// flags; an application token only reaches the target it names when that
// target is its own application.
@Injectable()
export class ApplicationTargetGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = this.reflector.get<ApplicationTarget | undefined>(
      APPLICATION_TARGET_METADATA_KEY,
      context.getHandler(),
    );
    const request = getRequest(context);
    const callingApplication: FlatApplication | undefined =
      request?.application;

    if (
      !isDefined(target) ||
      !isDefined(callingApplication) ||
      isOAuthOnlyApplication(callingApplication)
    ) {
      return true;
    }

    const targetValue = this.readTargetValue({ context, request, target });

    if (!isNonEmptyString(targetValue)) {
      throw new ApplicationException(
        `Missing application target "${this.getTargetName(target)}"`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    switch (target.kind) {
      case 'applicationId':
        return this.assertOrThrow(
          targetValue === callingApplication.id,
          'An application token can only target its own application',
        );
      case 'applicationUniversalIdentifier':
        return this.assertOrThrow(
          targetValue === callingApplication.universalIdentifier,
          'An application token can only target its own application',
        );
      case 'applicationRegistrationId':
        return this.assertOrThrow(
          targetValue === callingApplication.applicationRegistrationId,
          'An application token can only reach its own application registration',
        );
      case 'applicationOwnedEntity':
        return this.assertOrThrow(
          await this.isOwnedByCallingApplication({
            metadataName: target.metadataName,
            entityId: targetValue,
            callingApplication,
            workspaceId: request.workspace.id,
          }),
          'An application token can only reach its own application',
        );
      default:
        return assertUnreachable(target);
    }
  }

  private readTargetValue({
    context,
    request,
    target,
  }: {
    context: ExecutionContext;
    request: { params?: Record<string, unknown> };
    target: ApplicationTarget;
  }): unknown {
    switch (target.source) {
      case 'graphqlArg': {
        const argValue =
          GqlExecutionContext.create(context).getArgs()[target.argName];

        return isDefined(target.idKey)
          ? this.readPath(argValue, target.idKey)
          : argValue;
      }
      case 'graphqlArgs':
        return this.readPath(
          GqlExecutionContext.create(context).getArgs(),
          target.idKey,
        );
      case 'routeParam':
        return request.params?.[target.argName];
      default:
        return assertUnreachable(target);
    }
  }

  private readPath(value: unknown, path: string): unknown {
    return path
      .split('.')
      .reduce<unknown>(
        (currentValue, key) =>
          isObject(currentValue)
            ? (currentValue as Record<string, unknown>)[key]
            : undefined,
        value,
      );
  }

  private getTargetName(target: ApplicationTarget): string {
    switch (target.source) {
      case 'graphqlArg':
        return isDefined(target.idKey)
          ? `${target.argName}.${target.idKey}`
          : target.argName;
      case 'graphqlArgs':
        return target.idKey;
      case 'routeParam':
        return target.argName;
      default:
        return assertUnreachable(target);
    }
  }

  private async isOwnedByCallingApplication({
    metadataName,
    entityId,
    callingApplication,
    workspaceId,
  }: {
    metadataName: AllMetadataName;
    entityId: string;
    callingApplication: FlatApplication;
    workspaceId: string;
  }): Promise<boolean> {
    const flatMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    const flatEntityMapsByKey =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: [flatMapsKey] },
      );

    const flatEntityMaps: FlatEntityMaps<SyncableFlatEntity> =
      flatEntityMapsByKey[flatMapsKey];

    const flatEntity = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: entityId,
      flatEntityMaps,
    });

    // Unknown ids pass so the resolver keeps answering NOT_FOUND
    return (
      !isDefined(flatEntity) ||
      flatEntity.applicationId === callingApplication.id
    );
  }

  private assertOrThrow(isOwnTarget: boolean, message: string): true {
    if (!isOwnTarget) {
      throw new ApplicationException(
        message,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    return true;
  }
}
