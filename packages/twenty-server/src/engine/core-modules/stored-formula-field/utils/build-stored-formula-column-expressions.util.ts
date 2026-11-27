import { isDefined } from 'twenty-shared/utils';

import { type StoredFormulaColumnExpression } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-column-expression.type';
import { type CompiledFormulaField } from 'src/engine/metadata-modules/formula-field/types/compiled-formula-field.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompiledObjectFormulaFields } from 'src/engine/metadata-modules/formula-field/utils/compile-object-formula-fields.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import { type WorkspaceComputedLookupShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';

export type StoredFormulaComputationPass = {
  columnExpressions: StoredFormulaColumnExpression[];
  lookupJoins: WorkspaceComputedLookupShape[];
};

// A stored formula reading another one of the same record waits for a later pass, once that one is written
const splitIntoDependencyOrderedPasses = (
  storedFormulaFields: CompiledFormulaField[],
): CompiledFormulaField[][] => {
  const passes: CompiledFormulaField[][] = [];
  let remainingFormulaFields = storedFormulaFields;

  while (remainingFormulaFields.length > 0) {
    const remainingFieldMetadataIds = new Set(
      remainingFormulaFields.map(
        ({ flatFieldMetadata }) => flatFieldMetadata.id,
      ),
    );
    const readyFormulaFields = remainingFormulaFields.filter(
      ({ dependencies }) =>
        !dependencies.some(
          ({ alias, fieldMetadataId }) =>
            alias === COMPUTED_COLUMN_RECORD_ALIAS &&
            remainingFieldMetadataIds.has(fieldMetadataId),
        ),
    );
    // Formulas cannot read each other in a cycle; this only guards against looping forever
    const pass =
      readyFormulaFields.length > 0
        ? readyFormulaFields
        : remainingFormulaFields;

    passes.push(pass);
    remainingFormulaFields = remainingFormulaFields.filter(
      (formulaField) => !pass.includes(formulaField),
    );
  }

  return passes;
};

export const buildStoredFormulaColumnExpressions = ({
  formulaFieldMetadataIds,
  ...compilationArgs
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
  formulaFieldMetadataIds?: string[];
}): StoredFormulaComputationPass[] => {
  const { formulaFields, lookupShapes } =
    getCompiledObjectFormulaFields(compilationArgs);
  const storedFormulaFields = formulaFields.filter(
    ({ isStored, flatFieldMetadata }) =>
      isStored &&
      (!isDefined(formulaFieldMetadataIds) ||
        formulaFieldMetadataIds.includes(flatFieldMetadata.id)),
  );

  return splitIntoDependencyOrderedPasses(storedFormulaFields).map(
    (passFormulaFields) => {
      const readAliases = new Set(
        passFormulaFields.flatMap(({ dependencies }) =>
          dependencies.map(({ alias }) => alias),
        ),
      );

      return {
        columnExpressions: passFormulaFields.flatMap(
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
    },
  );
};
