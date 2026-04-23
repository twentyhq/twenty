import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import {
  type CreateEnumOperationSpec,
  EnumOperation,
  collectEnumOperationsForObject,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

export const generateWorkspaceSchemaDdl = (
  workspaceId: string,
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

    const flatFieldMetadatas = fieldMetadatas as unknown as FlatFieldMetadata[];
    const flatObjectMetadata = objectMetadata as unknown as FlatObjectMetadata;

    const enumOperations = collectEnumOperationsForObject({
      tableName,
      operation: EnumOperation.CREATE,
      flatFieldMetadatas,
    });

    for (const enumOperation of enumOperations) {
      const createOp = enumOperation as CreateEnumOperationSpec;
      const escapedValues = createOp.values.map(escapeLiteral).join(', ');

      statements.push(
        `CREATE TYPE ${escapeIdentifier(schemaName)}.${escapeIdentifier(createOp.enumName)} AS ENUM (${escapedValues});`,
      );
    }

    const columnDefinitions = flatFieldMetadatas.flatMap((flatFieldMetadata) =>
      generateColumnDefinitions({
        flatFieldMetadata,
        flatObjectMetadata,
        workspaceId,
      }),
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
