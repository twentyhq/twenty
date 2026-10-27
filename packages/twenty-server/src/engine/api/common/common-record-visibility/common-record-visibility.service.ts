import { Injectable } from '@nestjs/common';

import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Runs on every record of a result, nested relations included, so restricted fields cannot leak through a relation
// TODO(@charlesBochet): replace with row-level security once it can express channel visibility
@Injectable()
export class CommonRecordVisibilityService {
  private readonly handlersByObjectNameSingular = new Map<
    string,
    RecordVisibilityRestrictionHandler
  >();

  public registerHandler({
    objectNameSingular,
    handler,
  }: {
    objectNameSingular: string;
    handler: RecordVisibilityRestrictionHandler;
  }) {
    this.handlersByObjectNameSingular.set(objectNameSingular, handler);
  }

  public async applyVisibilityRestrictions({
    records,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    objectsPermissions,
  }: {
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    objectsPermissions: ObjectsPermissions;
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

    for (const [
      objectNameSingular,
      collectedRecords,
    ] of recordsByObjectNameSingular) {
      await this.handlersByObjectNameSingular
        .get(objectNameSingular)
        ?.applyVisibilityRestrictions({
          records: collectedRecords,
          authContext,
          objectsPermissions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });
    }
  }
}
