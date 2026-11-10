import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const SINGLE_COLUMN_DUPLICATE_KEY_DETAIL_PATTERN =
  /^Key \("?([A-Za-z0-9_]+)"?\)=\((.+)\) already exists\.$/;

export type DuplicateEntryDescription = {
  userFriendlyMessage: MessageDescriptor;
  flatObjectMetadata: FlatObjectMetadata;
  duplicateColumn?: { name: string; value: string };
};

const getStringProperty = (
  value: unknown,
  property: string,
): string | undefined => {
  if (typeof value !== 'object' || value === null || !(property in value)) {
    return undefined;
  }

  const propertyValue = (value as Record<string, unknown>)[property];

  return isNonEmptyString(propertyValue) ? propertyValue : undefined;
};

export const describeDuplicateEntry = ({
  duplicateEntryCause,
  isRestore,
  flatIndexMaps,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  duplicateEntryCause: unknown;
  isRestore: boolean;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): DuplicateEntryDescription | undefined => {
  const constraintName = getStringProperty(duplicateEntryCause, 'constraint');

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

  const indexedFlatFieldMetadatas = [
    ...flatIndexMetadata.flatIndexFieldMetadatas,
  ]
    .sort((indexFieldA, indexFieldB) => indexFieldA.order - indexFieldB.order)
    .map((indexField) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: indexField.fieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

  if (
    !isDefined(flatObjectMetadata) ||
    indexedFlatFieldMetadatas.length === 0
  ) {
    return undefined;
  }

  const [, duplicateColumnName, duplicateColumnValue] =
    getStringProperty(duplicateEntryCause, 'detail')?.match(
      SINGLE_COLUMN_DUPLICATE_KEY_DETAIL_PATTERN,
    ) ?? [];
  const duplicateColumn =
    isDefined(duplicateColumnName) &&
    isDefined(duplicateColumnValue) &&
    !indexedFlatFieldMetadatas.some(isMorphOrRelationFlatFieldMetadata)
      ? { name: duplicateColumnName, value: duplicateColumnValue }
      : undefined;

  const objectLabel = flatObjectMetadata.labelSingular;
  const fieldLabels = indexedFlatFieldMetadatas
    .map((flatFieldMetadata) => flatFieldMetadata.label)
    .join(', ');
  const conflictingFields = isDefined(duplicateColumn)
    ? `${fieldLabels} (${duplicateColumn.value})`
    : fieldLabels;

  return {
    userFriendlyMessage: isRestore
      ? msg`Cannot restore: another ${objectLabel} already has the same ${conflictingFields}.`
      : msg`Another ${objectLabel} already has the same ${conflictingFields}.`,
    flatObjectMetadata,
    duplicateColumn,
  };
};
