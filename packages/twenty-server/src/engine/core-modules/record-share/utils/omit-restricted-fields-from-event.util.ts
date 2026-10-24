import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildRestrictedFieldNames } from 'src/engine/core-modules/record-share/utils/build-restricted-field-names.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type EventProperties = {
  before?: object;
  after?: object;
  diff?: object;
  updatedFields?: string[];
};

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

  const omitRestrictedFields = (record: object | undefined) =>
    isDefined(record)
      ? Object.fromEntries(
          Object.entries(record).filter(
            ([fieldName]) => !restrictedFieldNames.has(fieldName),
          ),
        )
      : undefined;

  const properties = event.properties as EventProperties;
  const before = omitRestrictedFields(properties.before);
  const after = omitRestrictedFields(properties.after);
  const diff = omitRestrictedFields(properties.diff);

  return {
    ...event,
    properties: {
      ...properties,
      ...(isDefined(before) && { before }),
      ...(isDefined(after) && { after }),
      ...(isDefined(diff) && { diff }),
      ...(isDefined(properties.updatedFields) && {
        updatedFields: properties.updatedFields.filter(
          (fieldName) => !restrictedFieldNames.has(fieldName),
        ),
      }),
    },
  };
};
