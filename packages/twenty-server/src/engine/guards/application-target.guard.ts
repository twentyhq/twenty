import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { ApplicationRegistrationLookupService } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { readApplicationTargetIdOrThrow } from 'src/engine/core-modules/application/utils/read-application-target-id-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getRequest } from 'src/utils/extract-request';

// Sessions and API keys keep workspace-wide reach behind their permission
// flags; an application token only reaches the target it names when that
// target is its own application. Registration ownership runs for every
// principal: it is what stops another workspace from swapping an app's code
// to read its server variables.
@Injectable()
export class ApplicationTargetGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly applicationLookupService: ApplicationLookupService,
    private readonly applicationRegistrationLookupService: ApplicationRegistrationLookupService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = this.reflector.get<ApplicationTarget | undefined>(
      APPLICATION_TARGET_METADATA_KEY,
      context.getHandler(),
    );

    if (!isDefined(target)) {
      return true;
    }

    const request = getRequest(context);
    const callingApplication: FlatApplication | undefined =
      request?.application;
    const confinedApplication =
      isDefined(callingApplication) &&
      !isOAuthOnlyApplication(callingApplication)
        ? callingApplication
        : undefined;

    if (
      !isDefined(confinedApplication) &&
      !target.requireApplicationRegistrationOwnership
    ) {
      return true;
    }

    const targetId = readApplicationTargetIdOrThrow({
      context,
      request,
      target,
    });

    if (isDefined(confinedApplication)) {
      await this.assertReachableByApplicationOrThrow({
        target,
        targetId,
        callingApplication: confinedApplication,
        workspaceId: request.workspace.id,
      });
    }

    if (target.requireApplicationRegistrationOwnership) {
      await this.assertRegistrationOwnedOrThrow({
        target,
        targetId,
        workspaceId: request?.workspace?.id,
      });
    }

    return true;
  }

  private async assertReachableByApplicationOrThrow({
    target,
    targetId,
    callingApplication,
    workspaceId,
  }: {
    target: ApplicationTarget;
    targetId: string;
    callingApplication: FlatApplication;
    workspaceId: string;
  }): Promise<void> {
    switch (target.kind) {
      case 'applicationId':
        return this.assertOwnTargetOrThrow(
          targetId === callingApplication.id,
          'An application token can only target its own application',
        );
      case 'applicationUniversalIdentifier':
        return this.assertOwnTargetOrThrow(
          targetId === callingApplication.universalIdentifier,
          'An application token can only target its own application',
        );
      case 'applicationRegistrationId':
        return this.assertOwnTargetOrThrow(
          targetId === callingApplication.applicationRegistrationId,
          'An application token can only reach its own application registration',
        );
      case 'applicationOwnedEntity': {
        const flatEntity = await this.findFlatEntity({
          metadataName: target.metadataName,
          entityId: targetId,
          workspaceId,
        });

        // Unknown ids pass so the resolver keeps answering NOT_FOUND
        return this.assertOwnTargetOrThrow(
          !isDefined(flatEntity) ||
            flatEntity.applicationId === callingApplication.id,
          'An application token can only reach its own application',
        );
      }
      default:
        return assertUnreachable(target);
    }
  }

  private assertOwnTargetOrThrow(isOwnTarget: boolean, message: string): void {
    if (!isOwnTarget) {
      throw new ApplicationException(
        message,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }
  }

  private async assertRegistrationOwnedOrThrow({
    target,
    targetId,
    workspaceId,
  }: {
    target: ApplicationTarget;
    targetId: string;
    workspaceId: string | undefined;
  }): Promise<void> {
    if (!isNonEmptyString(workspaceId)) {
      throw new ApplicationException(
        'Missing workspace for the application registration ownership check',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    switch (target.kind) {
      case 'applicationRegistrationId':
        // Same owner-scoped lookup as the registration endpoints, so a foreign
        // id stays NOT_FOUND instead of confirming the registration exists
        await this.applicationRegistrationLookupService.findOneByIdOrThrow({
          applicationRegistrationId: targetId,
          ownerWorkspaceId: workspaceId,
        });

        return;
      case 'applicationUniversalIdentifier': {
        const application =
          await this.applicationLookupService.findByUniversalIdentifier({
            universalIdentifier: targetId,
            workspaceId,
          });

        return this.assertApplicationRegistrationOwnedOrThrow({
          application: {
            applicationRegistrationId:
              application?.applicationRegistrationId ?? null,
            universalIdentifier: targetId,
          },
          workspaceId,
        });
      }
      case 'applicationId':
        return this.assertApplicationRegistrationOwnedOrThrow({
          application: await this.findApplicationOrThrow({
            applicationId: targetId,
            workspaceId,
          }),
          workspaceId,
        });
      case 'applicationOwnedEntity': {
        const flatEntity = await this.findFlatEntity({
          metadataName: target.metadataName,
          entityId: targetId,
          workspaceId,
        });

        if (!isDefined(flatEntity)) {
          throw new ApplicationException(
            `${target.metadataName} "${targetId}" not found in workspace.`,
            ApplicationExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        return this.assertApplicationRegistrationOwnedOrThrow({
          application: await this.findApplicationOrThrow({
            applicationId: flatEntity.applicationId,
            workspaceId,
          }),
          workspaceId,
        });
      }
      default:
        return assertUnreachable(target);
    }
  }

  // The executor injects server variables from the linked registration
  private async assertApplicationRegistrationOwnedOrThrow({
    application: { applicationRegistrationId, universalIdentifier },
    workspaceId,
  }: {
    application: Pick<
      ApplicationEntity,
      'applicationRegistrationId' | 'universalIdentifier'
    >;
    workspaceId: string;
  }): Promise<void> {
    if (isDefined(applicationRegistrationId)) {
      await this.applicationRegistrationLookupService.findOneByIdOwnedByWorkspaceOrThrow(
        { applicationRegistrationId, workspaceId },
      );

      return;
    }

    await this.applicationRegistrationLookupService.findOneOwnedByWorkspaceOrThrow(
      {
        universalIdentifier,
        workspaceId,
      },
    );
  }

  private async findApplicationOrThrow({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationLookupService.findById({
      id: applicationId,
      workspaceId,
    });

    if (!isDefined(application)) {
      throw new ApplicationException(
        'Application not found in workspace.',
        ApplicationExceptionCode.APPLICATION_NOT_FOUND,
      );
    }

    return application;
  }

  private async findFlatEntity({
    metadataName,
    entityId,
    workspaceId,
  }: {
    metadataName: AllMetadataName;
    entityId: string;
    workspaceId: string;
  }): Promise<SyncableFlatEntity | undefined> {
    const flatMapsKey = getMetadataFlatEntityMapsKey(metadataName);

    const flatEntityMapsByKey =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: [flatMapsKey] },
      );

    const flatEntityMaps: FlatEntityMaps<SyncableFlatEntity> =
      flatEntityMapsByKey[flatMapsKey];

    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: entityId,
      flatEntityMaps,
    });
  }
}
