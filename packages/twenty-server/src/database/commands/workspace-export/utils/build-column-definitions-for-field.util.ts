import {
  type FieldMetadataDefaultValueForAnyType,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ColumnType } from 'typeorm';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { serializeDefaultValue } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/serialize-default-value.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

type CompositeDefaultValues = Record<
  string,
  FieldMetadataDefaultValueForAnyType
>;

const getCompositeDefaultValues = (
  defaultValue: unknown,
): CompositeDefaultValues | undefined => {
  if (
    isDefined(defaultValue) &&
    typeof defaultValue === 'object' &&
    !Array.isArray(defaultValue)
  ) {
    return defaultValue as CompositeDefaultValues;
  }

  return undefined;
};

const hasEnumOptions = (options: unknown): boolean =>
  Array.isArray(options) && options.length > 0;

const RELATION_FIELD_TYPES = new Set([
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
]);

const resolveColumnType = (
  fieldType: FieldMetadataType,
  schemaName: string,
  tableName: string,
  columnName: string,
  hasEnumValues: boolean,
): string => {
  const baseType = fieldMetadataTypeToColumnType(fieldType);

  if (baseType !== 'enum' || !hasEnumValues) {
    return baseType === 'enum' ? 'text' : baseType;
  }

  return `${escapeIdentifier(schemaName)}.${escapeIdentifier(computePostgresEnumName({ tableName, columnName }))}`;
};

export const buildColumnDefinitionsForField = (
  fieldMetadata: FieldMetadataEntity,
  schemaName: string,
  tableName: string,
): WorkspaceSchemaColumnDefinition[] => {
  if (RELATION_FIELD_TYPES.has(fieldMetadata.type)) {
    const joinColumnName = (
      fieldMetadata.settings as { joinColumnName?: string } | null
    )?.joinColumnName;

    if (!joinColumnName) return [];

    return [
      {
        name: joinColumnName,
        type: 'uuid',
        isNullable: true,
        isPrimary: false,
        isArray: false,
      },
    ];
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) return [];

    const compositeDefaultValues = getCompositeDefaultValues(
      fieldMetadata.defaultValue,
    );

    return compositeType.properties
      .filter((property) => !RELATION_FIELD_TYPES.has(property.type))
      .map((property) => {
        const columnName = computeCompositeColumnName(
          fieldMetadata.name,
          property,
        );
        const columnType = fieldMetadataTypeToColumnType(property.type);

        return {
          name: columnName,
          type: resolveColumnType(
            property.type,
            schemaName,
            tableName,
            columnName,
            hasEnumOptions(property.options),
          ),
          isNullable:
            fieldMetadata.isNullable !== false || !property.isRequired,
          isPrimary: false,
          isArray:
            property.type === FieldMetadataType.ARRAY ||
            property.type === FieldMetadataType.MULTI_SELECT ||
            Boolean(property.isArray),
          default: serializeDefaultValue({
            columnName,
            schemaName,
            tableName,
            columnType: columnType as ColumnType,
            defaultValue: compositeDefaultValues?.[property.name],
          }),
        };
      });
  }

  if (fieldMetadata.type === FieldMetadataType.TS_VECTOR) {
    return [
      {
        name: computeColumnName(fieldMetadata.name),
        type: 'tsvector',
        isNullable: true,
        isPrimary: false,
        isArray: false,
      },
    ];
  }

  const columnName = computeColumnName(fieldMetadata.name);
  const columnType = fieldMetadataTypeToColumnType(fieldMetadata.type);

  return [
    {
      name: columnName,
      type: resolveColumnType(
        fieldMetadata.type,
        schemaName,
        tableName,
        columnName,
        hasEnumOptions(fieldMetadata.options),
      ),
      isNullable: fieldMetadata.isNullable !== false,
      isPrimary: fieldMetadata.name === 'id',
      isArray:
        fieldMetadata.type === FieldMetadataType.ARRAY ||
        fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
      default: serializeDefaultValue({
        columnName,
        schemaName,
        tableName,
        columnType: columnType as ColumnType,
        defaultValue: fieldMetadata.defaultValue,
      }),
    },
  ];
};
