import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { type CommonSelection } from 'src/engine/api/common/types/common-selection.type';
import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

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
    selection,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    authContext,
    permissionsPrincipals,
    recordReadRestrictions,
  }: {
    records: ObjectRecord[];
    flatObjectMetadata: FlatObjectMetadata;
    selection: CommonSelection;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    authContext: WorkspaceAuthContext;
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext | undefined;
    recordReadRestrictions: RecordReadRestrictions;
  }): Promise<void> {
    if (this.handlersByObjectNameSingular.size === 0 || records.length === 0) {
      return;
    }

    const recordsByObjectNameSingular = collectRecordsByObjectNameSingular({
      records,
      flatObjectMetadata,
      selection,
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
          permissionsPrincipals,
          recordReadRestrictions,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });
    }
  }

  public async applyEventVisibilityRestrictions<
    TEvent extends ObjectRecordEvent,
  >({
    objectNameSingular,
    ...args
  }: {
    objectNameSingular: string;
    events: TEvent[];
    permissionsPrincipals: PermissionsPrincipalsWithRolesContext;
    recordReadRestrictions: RecordReadRestrictions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    const handler = this.handlersByObjectNameSingular.get(objectNameSingular);

    if (
      !isDefined(handler?.applyEventVisibilityRestrictions) ||
      args.events.length === 0
    ) {
      return args.events;
    }

    return handler.applyEventVisibilityRestrictions(args);
  }
}
