import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isNonEmptyString } from '@sniptt/guards';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { APPLICATION_TARGET_METADATA_KEY } from 'src/engine/core-modules/application/constants/application-target-metadata-key.constant';
import { type ApplicationTarget } from 'src/engine/core-modules/application/types/application-target.type';
import {
  getApplicationTargetName,
  readApplicationTargetValue,
} from 'src/engine/core-modules/application/utils/read-application-target-value.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getRequest } from 'src/utils/extract-request';

// Runs for every principal: owning the registration is what stops another
// workspace from swapping an app's code to read its server variables.
@Injectable()
export class ApplicationRegistrationOwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly applicationService: ApplicationService,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const target = this.reflector.get<ApplicationTarget | undefined>(
      APPLICATION_TARGET_METADATA_KEY,
      context.getHandler(),
    );

    if (!isDefined(target) || target.requireWorkspaceOwnership !== true) {
      return true;
    }

    const request = getRequest(context);
    const workspaceId: string | undefined = request?.workspace?.id;

    if (!isNonEmptyString(workspaceId)) {
      throw new ApplicationException(
        'Missing workspace for the application registration ownership check',
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    const targetValue = readApplicationTargetValue({
      context,
      request,
      target,
    });

    if (!isNonEmptyString(targetValue)) {
      throw new ApplicationException(
        `Missing application target "${getApplicationTargetName(target)}"`,
        ApplicationExceptionCode.FORBIDDEN,
      );
    }

    switch (target.kind) {
      case 'applicationRegistrationId':
        await this.applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow(
          { applicationRegistrationId: targetValue, workspaceId },
        );

        return true;
      case 'applicationUniversalIdentifier': {
        const application =
          await this.applicationService.findByUniversalIdentifier({
            universalIdentifier: targetValue,
            workspaceId,
          });

        await this.assertApplicationOwnedOrThrow({
          application: {
            applicationRegistrationId:
              application?.applicationRegistrationId ?? null,
            universalIdentifier: targetValue,
          },
          workspaceId,
        });

        return true;
      }
      case 'applicationId':
        await this.assertApplicationOwnedOrThrow({
          application: await this.findApplicationOrThrow({
            applicationId: targetValue,
            workspaceId,
          }),
          workspaceId,
        });

        return true;
      case 'applicationOwnedEntity': {
        const flatEntity = await this.findFlatEntity({
          metadataName: target.metadataName,
          entityId: targetValue,
          workspaceId,
        });

        if (!isDefined(flatEntity)) {
          throw new ApplicationException(
            `${target.metadataName} "${targetValue}" not found in workspace.`,
            ApplicationExceptionCode.ENTITY_NOT_FOUND,
          );
        }

        await this.assertApplicationOwnedOrThrow({
          application: await this.findApplicationOrThrow({
            applicationId: flatEntity.applicationId,
            workspaceId,
          }),
          workspaceId,
        });

        return true;
      }
      default:
        return assertUnreachable(target);
    }
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

  private async findApplicationOrThrow({
    applicationId,
    workspaceId,
  }: {
    applicationId: string;
    workspaceId: string;
  }): Promise<ApplicationEntity> {
    const application = await this.applicationService.findById({
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

  // The executor injects server variables from the linked registration
  private async assertApplicationOwnedOrThrow({
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
      await this.applicationRegistrationService.findOneByIdOwnedByWorkspaceOrThrow(
        { applicationRegistrationId, workspaceId },
      );

      return;
    }

    await this.applicationRegistrationService.findOneOwnedByWorkspaceOrThrow({
      universalIdentifier,
      workspaceId,
    });
  }
}
