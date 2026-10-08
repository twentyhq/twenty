import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

type EventProperties = {
  before?: object;
  after?: object;
  diff?: object;
  updatedFields?: string[];
};

const buildRestrictedFieldNames = ({
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): Set<string> => {
  const restrictedFieldNames = new Set<string>();

  for (const [fieldMetadataId, permissions] of Object.entries(
    restrictedFields,
  )) {
    if (permissions.canRead !== false) {
      continue;
    }

    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    restrictedFieldNames.add(flatFieldMetadata.name);

    if (
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      continue;
    }

    // The owning side of a relation also travels as its join column: the record
    // snapshots carry the ORM spelling, which settings can rename, while
    // computeUpdatedFieldsFromDiff always appends <name>Id.
    restrictedFieldNames.add(
      getJoinColumnNameForRelationField(flatFieldMetadata),
    );
    restrictedFieldNames.add(
      computeMorphOrRelationFieldJoinColumnName({
        name: flatFieldMetadata.name,
      }),
    );
  }

  return restrictedFieldNames;
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
