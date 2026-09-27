import {
  FieldMetadataType,
  RelationType,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import {
  buildSpreadsheetImportFields,
  isDefined,
  type SpreadsheetImportFieldDescriptor,
  type SpreadsheetImportFieldMetadata,
  type SpreadsheetImportObjectMetadata,
} from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Mirrors the fields the browser import offers: hidden system fields other
// than id, deletedAt and one-to-many relations are never importable.
const HIDDEN_SYSTEM_FIELD_NAMES = new Set(['id', 'searchVector', 'position']);

export type RecordImportMetadata = {
  importableFieldMetadataItems: SpreadsheetImportFieldMetadata[];
  spreadsheetImportFields: SpreadsheetImportFieldDescriptor[];
  objectMetadataItem: SpreadsheetImportObjectMetadata;
};

const toSpreadsheetImportFieldMetadata = (
  field: OrmFlatFieldMetadata,
): SpreadsheetImportFieldMetadata => {
  const relationType = (
    field.settings as { relationType?: RelationType } | null
  )?.relationType;

  return {
    id: field.id,
    name: field.name,
    label: field.label,
    type: field.type,
    isActive: field.isActive,
    isSystem: field.isSystem,
    settings: field.settings,
    defaultValue: field.defaultValue,
    options:
      (field.options as SpreadsheetImportFieldMetadata['options']) ?? null,
    relation:
      isDefined(field.relationTargetObjectMetadataId) && isDefined(relationType)
        ? {
            type: relationType,
            targetObjectMetadata: { id: field.relationTargetObjectMetadataId },
          }
        : null,
  };
};

const isImportableField = (
  field: SpreadsheetImportFieldMetadata,
  restrictedFields: RestrictedFieldsPermissions,
) =>
  field.isActive === true &&
  (field.isSystem !== true ||
    !HIDDEN_SYSTEM_FIELD_NAMES.has(field.name) ||
    field.name === 'id') &&
  field.name !== 'deletedAt' &&
  ((field.type !== FieldMetadataType.RELATION &&
    field.type !== FieldMetadataType.ACTOR) ||
    field.relation?.type === RelationType.MANY_TO_ONE) &&
  restrictedFields[field.id]?.canUpdate !== false;

export const buildRecordImportMetadata = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  restrictedFields,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  restrictedFields: RestrictedFieldsPermissions;
}): RecordImportMetadata => {
  const toObjectMetadata = (
    objectMetadata: FlatObjectMetadata,
  ): SpreadsheetImportObjectMetadata => ({
    id: objectMetadata.id,
    fields: getFlatFieldsFromFlatObjectMetadata(
      objectMetadata,
      flatFieldMetadataMaps,
    ).map(toSpreadsheetImportFieldMetadata),
    indexMetadatas: findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: objectMetadata.indexMetadataIds,
      flatEntityMaps: flatIndexMaps,
    }).map((index) => ({
      id: index.id,
      isUnique: index.isUnique,
      indexFieldMetadatas: index.flatIndexFieldMetadatas.map(
        ({ fieldMetadataId }) => ({ fieldMetadataId }),
      ),
    })),
  });

  const objectMetadataItem = toObjectMetadata(flatObjectMetadata);

  const relationTargetObjectMetadataItems = objectMetadataItem.fields
    .map((field) => field.relation?.targetObjectMetadata.id)
    .filter(isDefined)
    .map((objectMetadataId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      }),
    )
    .filter(isDefined)
    .map(toObjectMetadata);

  const importableFieldMetadataItems = objectMetadataItem.fields
    .filter((field) => isImportableField(field, restrictedFields))
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));

  return {
    importableFieldMetadataItems,
    objectMetadataItem,
    spreadsheetImportFields: buildSpreadsheetImportFields({
      fieldMetadataItems: importableFieldMetadataItems,
      objectMetadataItems: relationTargetObjectMetadataItems,
    }),
  };
};
