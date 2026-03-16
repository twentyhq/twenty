import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

import { buildColumnDefinitionsForField } from 'src/database/commands/workspace-export/utils/build-column-definitions-for-field.util';
import { buildEnumDefinitionsForField } from 'src/database/commands/workspace-export/utils/build-enum-definitions-for-field.util';

export const generateWorkspaceSchemaDdl = (
  schemaName: string,
  objectMetadatas: ObjectMetadataEntity[],
  fieldsByObjectId: Map<string, FieldMetadataEntity[]>,
): string[] => {
  const statements: string[] = [];

  for (const objectMetadata of objectMetadatas) {
    if (!objectMetadata.isActive) continue;

    const tableName = computeTableName(
      objectMetadata.nameSingular,
      objectMetadata.isCustom,
    );
    const fieldMetadatas = fieldsByObjectId.get(objectMetadata.id) ?? [];

    for (const fieldMetadata of fieldMetadatas) {
      for (const enumDefinition of buildEnumDefinitionsForField(
        fieldMetadata,
        schemaName,
        tableName,
      )) {
        const escapedEnumValues = enumDefinition.values
          .map(escapeLiteral)
          .join(', ');

        statements.push(
          `CREATE TYPE ${enumDefinition.qualifiedName} AS ENUM (${escapedEnumValues});`,
        );
      }
    }

    const columnDefinitions = fieldMetadatas.flatMap((fieldMetadata) =>
      buildColumnDefinitionsForField(fieldMetadata, schemaName, tableName),
    );

    if (columnDefinitions.length === 0) continue;

    const columnsSql = columnDefinitions
      .map(
        (columnDefinition) => `  ${buildSqlColumnDefinition(columnDefinition)}`,
      )
      .join(',\n');

    statements.push(
      `CREATE TABLE ${escapeIdentifier(schemaName)}.${escapeIdentifier(tableName)} (\n${columnsSql}\n);`,
    );
  }

  return statements;
};
