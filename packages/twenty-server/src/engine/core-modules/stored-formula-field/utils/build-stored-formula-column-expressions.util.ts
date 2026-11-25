import { isDefined } from 'twenty-shared/utils';

import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompiledObjectFormulaFields } from 'src/engine/metadata-modules/formula-field/utils/compile-object-formula-fields.util';
import { type WorkspaceComputedLookupShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export const buildStoredFormulaColumnExpressions = ({
  formulaFieldMetadataIds,
  ...compilationArgs
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
  const { formulaFields, lookupShapes } =
    getCompiledObjectFormulaFields(compilationArgs);
  const storedFormulaFields = formulaFields.filter(
    ({ isStored, flatFieldMetadata }) =>
      isStored &&
      (!isDefined(formulaFieldMetadataIds) ||
        formulaFieldMetadataIds.includes(flatFieldMetadata.id)),
  );
  const readAliases = new Set(
    storedFormulaFields.flatMap(({ dependencies }) =>
      dependencies.map(({ alias }) => alias),
    ),
  );

  return {
    columnExpressions: storedFormulaFields.flatMap(
      ({ flatFieldMetadata, columns }) =>
        columns.map(
          ({ columnName, sqlType, compositePropertyName, expression }) => ({
            fieldName: flatFieldMetadata.name,
            compositePropertyName,
            columnName,
            // Cast to the column type, so the computed value reads back exactly as the stored one
            expression: `(${expression ?? 'NULL'})::${sqlType}`,
          }),
        ),
    ),
    lookupJoins: lookupShapes.filter(({ alias }) => readAliases.has(alias)),
  };
};
