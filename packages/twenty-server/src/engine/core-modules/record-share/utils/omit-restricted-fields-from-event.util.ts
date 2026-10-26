import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { filterFieldNamesInEventProperties } from 'src/engine/core-modules/record-share/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/core-modules/record-share/utils/get-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const buildRestrictedFieldNames = ({
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Set<string> =>
  new Set(
    Object.entries(restrictedFields).flatMap(
      ([fieldMetadataId, permissions]) => {
        if (permissions.canRead !== false) {
          return [];
        }

        const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return isDefined(flatFieldMetadata)
          ? getFieldNamesInEventProperties(flatFieldMetadata)
          : [];
      },
    ),
  );

export const omitRestrictedFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  restrictedFields: RestrictedFieldsPermissions | undefined;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent => {
  if (!isDefined(restrictedFields)) {
    return event;
  }

  const restrictedFieldNames = buildRestrictedFieldNames({
    restrictedFields,
    flatFieldMetadataMaps,
  });

  if (restrictedFieldNames.size === 0) {
    return event;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      ...filterFieldNamesInEventProperties({
        properties: event.properties,
        isFieldNameKept: (fieldName) => !restrictedFieldNames.has(fieldName),
      }),
    },
  };
};
