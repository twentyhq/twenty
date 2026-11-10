import { isNonEmptyString, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type DuplicateEntryDescription } from 'src/engine/api/common/common-query-runners/types/duplicate-entry-description.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const SINGLE_COLUMN_DUPLICATE_KEY_DETAIL_PATTERN =
  /^Key \("?([A-Za-z0-9_]+)"?\)=\((.+)\) already exists\.$/;

const getStringProperty = ({
  value,
  property,
}: {
  value: unknown;
  property: string;
}): string | undefined => {
  if (!isObject(value) || !(property in value)) {
    return undefined;
  }

  const propertyValue: unknown = Reflect.get(value, property);

  return isNonEmptyString(propertyValue) ? propertyValue : undefined;
};

export const describeDuplicateEntry = ({
  duplicateEntryCause,
  flatIndexMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  duplicateEntryCause: unknown;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): DuplicateEntryDescription | undefined => {
  const constraintName = getStringProperty({
    value: duplicateEntryCause,
    property: 'constraint',
  });

  if (!isDefined(constraintName)) {
    return undefined;
  }

  const flatIndexMetadata = Object.values(flatIndexMaps.byUniversalIdentifier)
    .filter(isDefined)
    .find((candidate) => candidate.name === constraintName);

  if (!isDefined(flatIndexMetadata)) {
    return undefined;
  }

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: flatIndexMetadata.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const flatFieldMetadatas = [...flatIndexMetadata.flatIndexFieldMetadatas]
    .sort((indexFieldA, indexFieldB) => indexFieldA.order - indexFieldB.order)
    .map((indexField) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: indexField.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

  if (!isDefined(flatObjectMetadata) || flatFieldMetadatas.length === 0) {
    return undefined;
  }

  const [, duplicateColumnName, duplicateColumnValue] =
    getStringProperty({
      value: duplicateEntryCause,
      property: 'detail',
    })?.match(SINGLE_COLUMN_DUPLICATE_KEY_DETAIL_PATTERN) ?? [];

  if (
    !isDefined(duplicateColumnName) ||
    !isDefined(duplicateColumnValue) ||
    flatFieldMetadatas.some(isMorphOrRelationFlatFieldMetadata)
  ) {
    return { flatObjectMetadata, flatFieldMetadatas };
  }

  return {
    flatObjectMetadata,
    flatFieldMetadatas,
    duplicateColumn: { name: duplicateColumnName, value: duplicateColumnValue },
  };
};
