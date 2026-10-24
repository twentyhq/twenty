import { Injectable } from '@nestjs/common';

import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecord,
  type ObjectsPermissions,
} from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type RecordVisibilityRestrictionHandler } from 'src/engine/api/common/common-record-visibility/types/record-visibility-restriction-handler.type';
import { cloneEventRecords } from 'src/engine/api/common/common-record-visibility/utils/clone-event-records.util';
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
    flatFieldMetadataMaps,
  }: {
    events: TEvent[];
    flatObjectMetadata: FlatObjectMetadata;
    objectsPermissions: ObjectsPermissions;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  }): Promise<TEvent[]> {
    const handler = this.handlersByObjectNameSingular.get(
      flatObjectMetadata.nameSingular,
    );
    const applyEventVisibilityRestrictions =
      handler?.applyEventVisibilityRestrictions?.bind(handler);

    if (!isDefined(applyEventVisibilityRestrictions) || events.length === 0) {
      return events;
    }

    const clonedEvents = events.map(cloneEventRecords);

    await applyEventVisibilityRestrictions({
      records: clonedEvents.flatMap((event) => {
        const properties: Record<string, unknown> = { ...event.properties };

        return [properties.before, properties.after].flatMap((record) =>
          isPlainObject(record) ? [record] : [],
        );
      }),
      flatObjectMetadata,
      objectsPermissions,
      flatFieldMetadataMaps,
    });

    return clonedEvents.map(rebuildEventDiffFromRecords);
  }
}
