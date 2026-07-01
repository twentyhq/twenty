import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { deriveSearchVectorAsExpressionForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/derive-search-vector-as-expression-for-ts-vector-field.util';
import { getTargetSearchFieldMetadatasForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/get-target-search-field-metadatas-for-ts-vector-field.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { type SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { buildSqlColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/utils/build-sql-column-definition.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
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

const buildSearchFieldMetadataDerivationInputs = ({
  fieldMetadatas,
  objectSearchFieldMetadatas,
}: {
  fieldMetadatas: FieldMetadataEntity[];
  objectSearchFieldMetadatas: SearchFieldMetadataEntity[];
}): {
  indexedFieldById: ReadonlyMap<
    string,
    { name: string; type: FieldMetadataType }
  >;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
} => {
  const indexedFieldById = new Map(
    fieldMetadatas.map((fieldMetadata) => [
      fieldMetadata.id,
      { name: fieldMetadata.name, type: fieldMetadata.type },
    ]),
  );

  const searchVectorFieldId = fieldMetadatas.find(
    (fieldMetadata) =>
      fieldMetadata.type === FieldMetadataType.TS_VECTOR &&
      fieldMetadata.name === SEARCH_VECTOR_FIELD.name,
  )?.id;

  const byUniversalIdentifier = Object.fromEntries(
    objectSearchFieldMetadatas.map((searchFieldMetadata) => [
      searchFieldMetadata.universalIdentifier,
      {
        ...searchFieldMetadata,
        tsVectorFieldMetadataId:
          searchFieldMetadata.tsVectorFieldMetadataId ?? searchVectorFieldId,
      } as unknown as FlatSearchFieldMetadata,
    ]),
  );

  return {
    indexedFieldById,
    flatSearchFieldMetadataMaps: {
      byUniversalIdentifier,
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    },
  };
};

export const generateWorkspaceSchemaDdl = (
  workspaceId: string,
  schemaName: string,
  objectMetadatas: ObjectMetadataEntity[],
  fieldsByObjectId: Map<string, FieldMetadataEntity[]>,
  searchFieldMetadatasByObjectId: Map<string, SearchFieldMetadataEntity[]>,
): string[] => {
  const statements: string[] = [];

  for (const objectMetadata of objectMetadatas) {
    if (!objectMetadata.isActive) continue;

    const tableName = computeTableName(
      objectMetadata.nameSingular,
      objectMetadata.application?.universalIdentifier !==
        TWENTY_STANDARD_APPLICATION.universalIdentifier,
    );
    const fieldMetadatas = fieldsByObjectId.get(objectMetadata.id) ?? [];

    const flatFieldMetadatas = fieldMetadatas as unknown as FlatFieldMetadata[];
    const flatObjectMetadata = objectMetadata as unknown as FlatObjectMetadata;

    const { indexedFieldById, flatSearchFieldMetadataMaps } =
      buildSearchFieldMetadataDerivationInputs({
        fieldMetadatas,
        objectSearchFieldMetadatas:
          searchFieldMetadatasByObjectId.get(objectMetadata.id) ?? [],
      });

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
        searchVectorAsExpression: isFlatFieldMetadataOfType(
          flatFieldMetadata,
          FieldMetadataType.TS_VECTOR,
        )
          ? deriveSearchVectorAsExpressionForTsVectorField({
              targetSearchFieldMetadatas:
                getTargetSearchFieldMetadatasForTsVectorField({
                  tsVectorFieldMetadataId: flatFieldMetadata.id,
                  flatSearchFieldMetadataMaps,
                }),
              indexedFieldById,
            })
          : undefined,
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
