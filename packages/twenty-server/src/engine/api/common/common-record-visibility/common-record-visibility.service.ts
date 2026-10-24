import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { addRequiredFieldsToSelect } from 'src/engine/api/common/common-record-visibility/utils/add-required-fields-to-select.util';
import { collectRecordsByObjectNameSingular } from 'src/engine/api/common/common-record-visibility/utils/collect-records-by-object-name-singular.util';
import { rebuildEventDiffFromRecords } from 'src/engine/api/common/common-record-visibility/utils/rebuild-event-diff-from-records.util';
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

  public async applyEventVisibilityRestrictions<
    TEvent extends ObjectRecordEvent,
  >({
    events,
    flatObjectMetadata,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    events: TEvent[];
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    const handler = this.handlersByObjectNameSingular.get(
      flatObjectMetadata.nameSingular,
    );
    const applyEventVisibilityRestrictions =
      handler?.applyEventVisibilityRestrictions?.bind(handler);

    if (
      !isDefined(applyEventVisibilityRestrictions) ||
      !isNonEmptyArray(events)
    ) {
      return events;
    }

    const clonedEvents = events.map((event) => structuredClone(event));

    await applyEventVisibilityRestrictions({
      records: clonedEvents.flatMap(({ properties }) =>
        [
          'before' in properties ? properties.before : undefined,
          'after' in properties ? properties.after : undefined,
        ].filter(isPlainObject),
      ),
      objectsPermissions,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    return clonedEvents.map(rebuildEventDiffFromRecords);
  }

  public getSelectWithRequiredFields({
    select,
    flatObjectMetadata,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }: {
    select: CommonSelectedFields;
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): CommonSelectedFields {
    if (this.handlersByObjectNameSingular.size === 0) {
      return select;
    }

    return addRequiredFieldsToSelect({
      select,
      flatObjectMetadata,
      resolveRequiredFieldNames: (selectedFlatObjectMetadata) =>
        this.handlersByObjectNameSingular
          .get(selectedFlatObjectMetadata.nameSingular)
          ?.getRequiredFieldNames?.({
            flatObjectMetadata: selectedFlatObjectMetadata,
            objectsPermissions,
            flatFieldMetadataMaps,
          }) ?? [],
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });
  }
}
