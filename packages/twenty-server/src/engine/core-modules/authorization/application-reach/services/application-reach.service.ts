import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { findWorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContextEntry } from 'src/engine/core-modules/auth/types/workspace-auth-context-entry.type';
import { APPLICATION_REACH_ENFORCED_METADATA_NAMES } from 'src/engine/core-modules/authorization/application-reach/constants/application-reach-enforced-metadata-names.constant';
import { ApplicationReachRefusedException } from 'src/engine/core-modules/authorization/application-reach/exceptions/application-reach-refused.exception';
import { type ApplicationReachMetadataName } from 'src/engine/core-modules/authorization/application-reach/types/application-reach-metadata-name.type';
import { type ApplicationReach } from 'src/engine/core-modules/authorization/application-reach/types/application-reach.type';
import { type ApplicationTargetAccess } from 'src/engine/core-modules/authorization/application-reach/types/application-target-access.type';
import { getReachableApplicationId } from 'src/engine/core-modules/authorization/application-reach/utils/get-reachable-application-id.util';
import { resolveApplicationReach } from 'src/engine/core-modules/authorization/application-reach/utils/resolve-application-reach.util';
import { restrictFlatEntityMapsToApplication } from 'src/engine/core-modules/authorization/application-reach/utils/restrict-flat-entity-maps-to-application.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

// The one module deciding which applications' entities a caller reaches.
// Services read entities through it, so every transport gets the same answer.
@Injectable()
export class ApplicationReachService {
  private readonly logger = new Logger(ApplicationReachService.name);

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  // undefined when the current flow reaches nothing
  async findCurrentReach(
    workspaceId: string,
  ): Promise<ApplicationReach | undefined> {
    const entry = findWorkspaceAuthContextEntry();

    if (!isDefined(entry) || entry.authContext.workspace.id !== workspaceId) {
      return undefined;
    }

    return this.resolveEntryReach({ entry, workspaceId });
  }

  async getReachableFlatEntityMaps<
    TMetadataName extends ApplicationReachMetadataName,
  >({
    workspaceId,
    metadataName,
    access,
  }: {
    workspaceId: string;
    metadataName: TMetadataName;
    access: ApplicationTargetAccess;
  }): Promise<MetadataFlatEntityMaps<TMetadataName>> {
    const flatMapsKey = getMetadataFlatEntityMapsKey(metadataName);
    const flatEntityMapsByKey =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: [flatMapsKey] },
      );
    const flatEntityMaps = flatEntityMapsByKey[
      flatMapsKey
    ] as unknown as FlatEntityMaps<SyncableFlatEntity>;

    const reach = await this.findCurrentReach(workspaceId);
    const isEnforced =
      APPLICATION_REACH_ENFORCED_METADATA_NAMES.has(metadataName);

    if (!isDefined(reach)) {
      if (isEnforced) {
        throw new ApplicationReachRefusedException(
          `No attested caller can reach ${metadataName}`,
        );
      }

      this.logger.warn(
        `[application-reach] unattested read of ${metadataName} in workspace ${workspaceId} would be refused`,
      );

      return flatEntityMaps as unknown as MetadataFlatEntityMaps<TMetadataName>;
    }

    const reachableApplicationId = getReachableApplicationId({
      reach,
      access,
    });

    if (!isDefined(reachableApplicationId)) {
      return flatEntityMaps as unknown as MetadataFlatEntityMaps<TMetadataName>;
    }

    const restrictedFlatEntityMaps = restrictFlatEntityMapsToApplication({
      flatEntityMaps,
      applicationId: reachableApplicationId,
    });

    if (isEnforced) {
      return restrictedFlatEntityMaps as unknown as MetadataFlatEntityMaps<TMetadataName>;
    }

    return this.withOutOfReachReadWarnings({
      flatEntityMaps,
      restrictedFlatEntityMaps,
      metadataName,
      access,
    }) as unknown as MetadataFlatEntityMaps<TMetadataName>;
  }

  async assertCanCreateOrThrow({
    workspaceId,
    metadataName,
    ownerApplicationId,
  }: {
    workspaceId: string;
    metadataName: ApplicationReachMetadataName;
    ownerApplicationId: string;
  }): Promise<void> {
    const reach = await this.findCurrentReach(workspaceId);

    this.assertManagedOrThrow({
      reach,
      metadataName,
      ownerApplicationIds: [ownerApplicationId],
      isEntryMissing: false,
    });
  }

  // The migration runner's backstop: every entity a migration writes must be managed by the caller
  async assertCanManageFlatEntitiesOrThrow({
    workspaceId,
    metadataName,
    flatEntities,
  }: {
    workspaceId: string;
    metadataName: ApplicationReachMetadataName;
    flatEntities: { applicationId: string }[];
  }): Promise<void> {
    if (flatEntities.length === 0) {
      return;
    }

    const entry = findWorkspaceAuthContextEntry();
    const reach = await this.findCurrentReach(workspaceId);

    this.assertManagedOrThrow({
      reach,
      metadataName,
      ownerApplicationIds: flatEntities.map(
        (flatEntity) => flatEntity.applicationId,
      ),
      isEntryMissing: !isDefined(entry),
    });
  }

  private assertManagedOrThrow({
    reach,
    metadataName,
    ownerApplicationIds,
    isEntryMissing,
  }: {
    reach: ApplicationReach | undefined;
    metadataName: ApplicationReachMetadataName;
    ownerApplicationIds: string[];
    isEntryMissing: boolean;
  }): void {
    const reachableApplicationId = isDefined(reach)
      ? getReachableApplicationId({ reach, access: 'manage' })
      : undefined;

    const isManaged =
      isDefined(reach) &&
      (!isDefined(reachableApplicationId) ||
        ownerApplicationIds.every(
          (ownerApplicationId) => ownerApplicationId === reachableApplicationId,
        ));

    if (isManaged) {
      return;
    }

    // Flows nothing opened an entry for (jobs, commands) are left to the global fail-closed guard
    if (
      isEntryMissing ||
      !APPLICATION_REACH_ENFORCED_METADATA_NAMES.has(metadataName)
    ) {
      this.logger.warn(
        `[application-reach] write of ${metadataName} owned by ${ownerApplicationIds.join(', ')} would be refused (${isEntryMissing ? 'no auth context entry' : 'report only'})`,
      );

      return;
    }

    throw new ApplicationReachRefusedException(
      `The caller cannot manage this ${metadataName}`,
    );
  }

  private async resolveEntryReach({
    entry,
    workspaceId,
  }: {
    entry: WorkspaceAuthContextEntry;
    workspaceId: string;
  }): Promise<ApplicationReach | undefined> {
    if (entry.principal.kind === 'unattested') {
      return undefined;
    }

    if (entry.principal.kind === 'system') {
      return { kind: 'workspace' };
    }

    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    return resolveApplicationReach({
      entry,
      workspaceCustomApplicationId: await this.findWorkspaceCustomApplicationId(
        {
          entry,
          workspaceId,
        },
      ),
      twentyStandardApplicationId:
        flatApplicationMaps.idByUniversalIdentifier[
          TWENTY_STANDARD_APPLICATION.universalIdentifier
        ],
    });
  }

  private async findWorkspaceCustomApplicationId({
    entry,
    workspaceId,
  }: {
    entry: WorkspaceAuthContextEntry;
    workspaceId: string;
  }): Promise<string> {
    const workspaceCustomApplicationId =
      entry.authContext.workspace.workspaceCustomApplicationId;

    if (isNonEmptyString(workspaceCustomApplicationId)) {
      return workspaceCustomApplicationId;
    }

    const workspace = await this.workspaceRepository.findOne({
      select: ['id', 'workspaceCustomApplicationId'],
      where: { id: workspaceId },
      withDeleted: true,
    });

    return workspace?.workspaceCustomApplicationId ?? '';
  }

  private withOutOfReachReadWarnings({
    flatEntityMaps,
    restrictedFlatEntityMaps,
    metadataName,
    access,
  }: {
    flatEntityMaps: FlatEntityMaps<SyncableFlatEntity>;
    restrictedFlatEntityMaps: FlatEntityMaps<SyncableFlatEntity>;
    metadataName: ApplicationReachMetadataName;
    access: ApplicationTargetAccess;
  }): FlatEntityMaps<SyncableFlatEntity> {
    const warnedUniversalIdentifiers = new Set<string>();
    const logger = this.logger;

    return {
      ...flatEntityMaps,
      byUniversalIdentifier: new Proxy(flatEntityMaps.byUniversalIdentifier, {
        get(target, property, receiver) {
          const flatEntity = Reflect.get(target, property, receiver);

          if (
            typeof property === 'string' &&
            isDefined(flatEntity) &&
            !isDefined(
              restrictedFlatEntityMaps.byUniversalIdentifier[property],
            ) &&
            !warnedUniversalIdentifiers.has(property)
          ) {
            warnedUniversalIdentifiers.add(property);
            logger.warn(
              `[application-reach] ${access} read of ${metadataName} ${property} would be refused`,
            );
          }

          return flatEntity;
        },
      }),
    };
  }
}
