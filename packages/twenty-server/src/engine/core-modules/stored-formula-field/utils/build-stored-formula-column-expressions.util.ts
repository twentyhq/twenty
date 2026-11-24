import { compositeTypeDefinitions } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaEvaluation,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { buildFormulaSqlAggregationSourceResolver } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-aggregation-source-resolver.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A formula that no longer compiles stores no value, as it reads when computed at query time
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
}): StoredFormulaColumnExpression[] => {
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
    return [];
  }

  const tableName = computeObjectTargetTable(flatObjectMetadata);
  const resolveReference = buildFormulaSqlReferenceResolverFromDescriptors({
    fields: buildFormulaFieldDescriptorsFromFlatEntityMaps({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
  });
  const resolveAggregationSource = buildFormulaSqlAggregationSourceResolver({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    schemaName,
  });

  return storedFormulaFlatFieldMetadatas.flatMap(
    ({ name, type, settings }): StoredFormulaColumnExpression[] => {
      const expression = getFieldMetadataFormulaExpression({ settings });

      if (!isFormulaFieldMetadataType(type) || !isDefined(expression)) {
        return [];
      }

      const compilation = compileFormulaFieldToSql({
        fieldMetadataType: type,
        expression,
        currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
          settings,
        }),
        selectEnumSqlType: `${escapeIdentifier(schemaName)}.${escapeIdentifier(
          computePostgresEnumName({ tableName, columnName: name }),
        )}`,
        resolveReference,
        resolveAggregationSource,
      });
      const compositeProperties =
        compositeTypeDefinitions.get(type)?.properties;

      if (!isDefined(compositeProperties)) {
        return [
          {
            fieldName: name,
            columnName: name,
            expression: compilation.isValid
              ? compilation.expressions[0].expression
              : 'NULL',
          },
        ];
      }

      return compositeProperties.map((compositeProperty) => ({
        fieldName: name,
        compositePropertyName: compositeProperty.name,
        columnName: computeCompositeColumnName(name, compositeProperty),
        expression:
          (compilation.isValid
            ? compilation.expressions.find(
                ({ compositePropertyName }) =>
                  compositePropertyName === compositeProperty.name,
              )?.expression
            : undefined) ?? 'NULL',
      }));
    },
  );
};
