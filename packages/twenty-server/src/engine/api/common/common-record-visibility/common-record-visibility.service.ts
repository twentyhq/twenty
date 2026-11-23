import { Injectable } from '@nestjs/common';

import { type FeatureFlagKey, type ObjectRecord } from 'twenty-shared/types';

import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isChannelVisibilityRlsEnabled } from 'src/engine/permissions/channel-visibility/utils/is-channel-visibility-rls-enabled.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

// Runs on every record of a result, nested relations included, so restricted fields cannot leak through a relation
// TODO(@charlesBochet): replace with row-level security once it can express channel visibility
@Injectable()
export class CommonRecordVisibilityService {
  private readonly handlersByObjectNameSingular = new Map<
    string,
    RecordVisibilityRestrictionHandler
  >();

  private readonly objectNameSingularsCoveredByChannelVisibilityRules =
    new Set<string>();

  public registerHandler({
    objectNameSingular,
    handler,
    isCoveredByChannelVisibilityRules = false,
  }: {
    objectNameSingular: string;
    handler: RecordVisibilityRestrictionHandler;
    isCoveredByChannelVisibilityRules?: boolean;
  }) {
    this.handlersByObjectNameSingular.set(objectNameSingular, handler);

    if (isCoveredByChannelVisibilityRules) {
      this.objectNameSingularsCoveredByChannelVisibilityRules.add(
        objectNameSingular,
      );
    }
  }

  public async applyVisibilityRestrictions({
    records,
    flatObjectMetadata,
    selection,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    recordReadRestrictions,
    featureFlagsMap,
  }: {
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    recordReadRestrictions: RecordReadRestrictions;
    featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  }): Promise<void> {
    const objectNameSingulars = new Set(
      [...this.handlersByObjectNameSingular.keys()].filter(
        (objectNameSingular) =>
          !isChannelVisibilityRlsEnabled(featureFlagsMap) ||
          !this.objectNameSingularsCoveredByChannelVisibilityRules.has(
            objectNameSingular,
          ),
      ),
    );

    if (objectNameSingulars.size === 0 || records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      selection,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectNameSingulars,
    });

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
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
