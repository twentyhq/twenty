import {
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';

import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';
import { createFormulaLookupAliasAllocator } from 'src/engine/metadata-modules/formula-field/utils/create-formula-lookup-alias-allocator.util';
import { type WorkspaceComputedLookupShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { buildFormulaSqlAggregationSourceResolver } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-aggregation-source-resolver.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldColumns } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-columns.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export const buildStoredFormulaColumnExpressions = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
  formulaFieldMetadataIds,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
  formulaFieldMetadataIds?: string[];
}): {
  columnExpressions: StoredFormulaColumnExpression[];
  lookupJoins: WorkspaceComputedLookupShape[];
} => {
  const storedFormulaFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).filter(
    ({ id, settings }) =>
      getFieldMetadataFormulaEvaluation({ settings }) === 'STORED' &&
      (!isDefined(formulaFieldMetadataIds) ||
        formulaFieldMetadataIds.includes(id)),
  );

  if (storedFormulaFlatFieldMetadatas.length === 0) {
    return { columnExpressions: [], lookupJoins: [] };
  }

  const tableName = computeObjectTargetTable(flatObjectMetadata);
  const { getLookupAlias, getLookupShapes } =
    createFormulaLookupAliasAllocator();
  const resolveReference = buildFormulaSqlReferenceResolverFromDescriptors({
    fields: buildFormulaFieldDescriptorsFromFlatEntityMaps({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
    getLookupAlias,
  });
  const resolveAggregationSource = buildFormulaSqlAggregationSourceResolver({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    schemaName,
  });

  const columnExpressions = storedFormulaFlatFieldMetadatas.flatMap(
    (storedFormulaFlatFieldMetadata): StoredFormulaColumnExpression[] =>
      (
        compileFormulaFieldColumns({
          flatFieldMetadata: storedFormulaFlatFieldMetadata,
          schemaName,
          tableName,
          resolveReference,
          resolveAggregationSource,
        }) ?? []
      ).map(({ columnName, sqlType, compositePropertyName, expression }) => ({
        fieldName: storedFormulaFlatFieldMetadata.name,
        compositePropertyName,
        columnName,
        // Cast to the column type, so the computed value reads back exactly as the stored one
        expression: `(${expression ?? 'NULL'})::${sqlType}`,
      })),
  );

  return {
    columnExpressions,
    lookupJoins: getLookupShapes(),
  };
};
