import { Injectable } from '@nestjs/common';

import { FeatureFlagKey, type ObjectRecord } from 'twenty-shared/types';

import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Runs on every record of a result, nested relations included, so restricted fields cannot leak through a relation
// TODO(@charlesBochet): replace with row-level security once it can express channel visibility
@Injectable()
export class CommonRecordVisibilityService {
  private readonly handlersByObjectNameSingular = new Map<
    string,
    RecordVisibilityRestrictionHandler
  >();
  private readonly objectNameSingularsReplacedByChannelVisibilityRules =
    new Set<string>();

  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  public registerHandler({
    objectNameSingular,
    handler,
    isReplacedByChannelVisibilityRules = false,
  }: {
    objectNameSingular: string;
    handler: RecordVisibilityRestrictionHandler;
    isReplacedByChannelVisibilityRules?: boolean;
  }) {
    this.handlersByObjectNameSingular.set(objectNameSingular, handler);

    if (isReplacedByChannelVisibilityRules) {
      this.objectNameSingularsReplacedByChannelVisibilityRules.add(
        objectNameSingular,
      );
    }
  }

  public async applyVisibilityRestrictions({
    records,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    recordReadRestrictions,
  }: {
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    recordReadRestrictions: RecordReadRestrictions;
  }): Promise<void> {
    if (this.handlersByObjectNameSingular.size === 0 || records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingulars: new Set(this.handlersByObjectNameSingular.keys()),
    });

    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      authContext.workspace.id,
      ['featureFlagsMap'],
    );
    const isChannelVisibilityRlsEnabled =
      featureFlagsMap[FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED] ??
      false;

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
      if (
        isChannelVisibilityRlsEnabled &&
        this.objectNameSingularsReplacedByChannelVisibilityRules.has(
          objectNameSingular,
        )
      ) {
        continue;
      }

      await this.handlersByObjectNameSingular
        .get(objectNameSingular)
        ?.applyVisibilityRestrictions({
          records: collectedRecords,
          authContext,
          recordReadRestrictions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });
    }
  }
}
