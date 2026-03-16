import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type WorkspaceEnumDefinition = {
  qualifiedName: string;
  values: string[];
};

const ENUM_FIELD_TYPES = new Set([
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
]);

const buildQualifiedEnumTypeName = (
  schemaName: string,
  tableName: string,
  columnName: string,
): string =>
  `${escapeIdentifier(schemaName)}.${escapeIdentifier(computePostgresEnumName({ tableName, columnName }))}`;

const extractEnumValues = (options: unknown): string[] => {
  if (!Array.isArray(options)) return [];

  return options
    .filter(isDefined)
    .filter((option): option is { value: string } =>
      isNonEmptyString((option as { value?: unknown }).value),
    )
    .map((option) => option.value);
};

export const buildEnumDefinitionsForField = (
  fieldMetadata: FieldMetadataEntity,
  schemaName: string,
  tableName: string,
): WorkspaceEnumDefinition[] => {
  const enumDefinitions: WorkspaceEnumDefinition[] = [];

  if (ENUM_FIELD_TYPES.has(fieldMetadata.type)) {
    const columnName = computeColumnName(fieldMetadata.name);
    const values = extractEnumValues(fieldMetadata.options);

    if (values.length > 0) {
      enumDefinitions.push({
        qualifiedName: buildQualifiedEnumTypeName(
          schemaName,
          tableName,
          columnName,
        ),
        values,
      });
    }
  }

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const compositeType = compositeTypeDefinitions.get(fieldMetadata.type);

    if (!compositeType) return enumDefinitions;

    for (const property of compositeType.properties) {
      if (ENUM_FIELD_TYPES.has(property.type)) {
        const columnName = computeCompositeColumnName(
          fieldMetadata.name,
          property,
        );
        const values = extractEnumValues(property.options);

        if (values.length > 0) {
          enumDefinitions.push({
            qualifiedName: buildQualifiedEnumTypeName(
              schemaName,
              tableName,
              columnName,
            ),
            values,
          });
        }
      }
    }
  }

  return enumDefinitions;
};
