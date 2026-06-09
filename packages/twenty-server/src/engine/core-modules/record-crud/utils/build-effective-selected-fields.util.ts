import Fuse from 'fuse.js';
import { FieldMetadataType } from 'twenty-shared/types';

import { isNull, isObject } from '@sniptt/guards';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isDefined } from 'twenty-shared/utils';

const SEARCH_VECTOR_FIELD = 'searchVector';
const LOGICAL_OPERATORS = new Set(['and', 'or', 'not']);

const SUB_FIELDS_TO_EXCLUDE_BY_FIELD_TYPE: Partial<
  Record<FieldMetadataType, Set<string>>
> = {
  [FieldMetadataType.RICH_TEXT]: new Set(['blocknote']),
};

const buildSelectedField = (
  rawSelect: string[],
  filterFieldNames: string[],
  orderByFieldNames: string[],
  allSelectableFieldNames: string[],
  labelIdentifierFieldName: string,
  objectName: string,
): { select: string[]; warnings: string[] } => {
  const cleanFieldNames = allSelectableFieldNames.filter(
    (name) => name !== SEARCH_VECTOR_FIELD,
  );

  const implicitFields = [
    'id',
    labelIdentifierFieldName,
    ...filterFieldNames,
    ...orderByFieldNames,
  ].filter((name) => cleanFieldNames.includes(name));

  if (rawSelect.includes('*')) {
    return { select: cleanFieldNames, warnings: [] };
  }

  const warnings: string[] = [];
  const validFields: string[] = [...implicitFields];

  for (const requestedName of rawSelect) {
    if (implicitFields.includes(requestedName)) {
      continue;
    }

    if (cleanFieldNames.includes(requestedName)) {
      validFields.push(requestedName);
    } else {
      const suggestions = findSimilarFieldNames(requestedName, cleanFieldNames);
      const hint =
        suggestions.length > 0
          ? ` Did you mean: ${suggestions.map((s) => `'${s}'`).join(', ')}?`
          : '';

      warnings.push(
        `Field '${requestedName}' not found on ${objectName}.${hint}`,
      );
    }
  }

  return { select: [...new Set(validFields)], warnings };
};

const extractFilterFieldNames = (
  filter:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | Partial<ObjectRecordFilter>
    | Partial<ObjectRecordFilter>[]
    | undefined,
): string[] => {
  if (Array.isArray(filter)) {
    return filter.flatMap((filterItem) => extractFilterFieldNames(filterItem));
  }

  if (!isDefined(filter)) {
    return [];
  }

  return Object.entries(filter).flatMap(([key, value]) => {
    if (LOGICAL_OPERATORS.has(key)) {
      return extractFilterFieldNames(
        value as Record<string, unknown> | Record<string, unknown>[],
      );
    }

    return [key];
  });
};

const extractOrderByFieldNames = (orderBy: unknown): string[] => {
  if (!Array.isArray(orderBy)) {
    return [];
  }

  return orderBy.flatMap((item) => (isObject(item) ? Object.keys(item) : []));
};

const buildSelectedFieldsOverride = (
  select: string[],
  allSelectableFields: CommonSelectedFields,
  fieldNameToType: Map<string, FieldMetadataType>,
): CommonSelectedFields => {
  const fieldsToInclude = new Set([...select, 'id']);

  const fieldsToProcess = Object.fromEntries(
    Object.entries(allSelectableFields).filter(([fieldName]) =>
      fieldsToInclude.has(fieldName),
    ),
  );

  return stripSubFieldsByType(fieldsToProcess, fieldNameToType);
};

export const buildEffectiveSelectedFields = ({
  select,
  filter,
  orderBy,
  objectName,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  selectedFields,
}: {
  select: string[];
  filter?:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | Partial<ObjectRecordFilter>
    | Partial<ObjectRecordFilter>[];
  orderBy: unknown;
  objectName: string;
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  selectedFields: CommonSelectedFields;
}): { effectiveSelectedFields: CommonSelectedFields; warnings: string[] } => {
  const filterFieldNames = extractFilterFieldNames(filter);
  const orderByFieldNames = extractOrderByFieldNames(orderBy);

  const labelIdentifierField = flatObjectMetadata.labelIdentifierFieldMetadataId
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: flatObjectMetadata.labelIdentifierFieldMetadataId,
      })
    : undefined;

  const labelIdentifierFieldName = labelIdentifierField?.name ?? 'id';

  const { select: cleanSelect, warnings } = buildSelectedField(
    select,
    filterFieldNames,
    orderByFieldNames,
    Object.keys(selectedFields),
    labelIdentifierFieldName,
    objectName,
  );

  const fieldNameToType = buildFieldNameToTypeMap(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  return {
    effectiveSelectedFields: buildSelectedFieldsOverride(
      cleanSelect,
      selectedFields,
      fieldNameToType,
    ),
    warnings,
  };
};

const buildFieldNameToTypeMap = (
  flatObjectMetadata: FlatObjectMetadata,
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
): Map<string, FieldMetadataType> => {
  const map = new Map<string, FieldMetadataType>();

  for (const fieldId of flatObjectMetadata.fieldIds) {
    const field = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldId,
    });

    if (isDefined(field)) {
      map.set(field.name, field.type);
    }
  }

  return map;
};

const stripSubFieldsByType = (
  fields: CommonSelectedFields,
  fieldNameToType: Map<string, FieldMetadataType>,
): CommonSelectedFields => {
  const result: CommonSelectedFields = {};

  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    result[fieldName] = stripFieldSubFieldsByType(
      fieldName,
      fieldValue,
      fieldNameToType,
    );
  }

  return result;
};

const stripFieldSubFieldsByType = (
  fieldName: string,
  fieldValue: boolean | CommonSelectedFields,
  fieldNameToType: Map<string, FieldMetadataType>,
): boolean | CommonSelectedFields => {
  if (!isObject(fieldValue) || isNull(fieldValue)) {
    return fieldValue;
  }

  const fieldType = fieldNameToType.get(fieldName);
  const subFieldsToExclude = isDefined(fieldType)
    ? SUB_FIELDS_TO_EXCLUDE_BY_FIELD_TYPE[fieldType]
    : undefined;

  if (!isDefined(subFieldsToExclude)) {
    return fieldValue;
  }

  const stripped: CommonSelectedFields = {};

  for (const [subFieldName, subFieldValue] of Object.entries(fieldValue)) {
    if (!subFieldsToExclude.has(subFieldName)) {
      stripped[subFieldName] = subFieldValue as boolean;
    }
  }

  return stripped;
};

const findSimilarFieldNames = (
  name: string,
  fieldNames: string[],
): string[] => {
  const fuse = new Fuse(fieldNames, {
    includeScore: true,
    threshold: 0.4,
  });

  return fuse
    .search(name)
    .slice(0, 3)
    .map((result) => result.item);
};
