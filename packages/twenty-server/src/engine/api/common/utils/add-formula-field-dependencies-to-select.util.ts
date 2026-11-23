import { isDefined } from 'twenty-shared/utils';

import {
  type CommonRelationSelection,
  type CommonSelection,
} from 'src/engine/api/common/types/common-selection.type';
import { getRelationSelectionEntries } from 'src/engine/api/common/utils/get-relation-selection-entries.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';
import { getFormulaFieldEvaluationPlans } from 'src/engine/metadata-modules/formula-field/utils/get-formula-field-evaluation-plans.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

const canReadFormulaFieldDependencies = ({
  formulaFieldEvaluationPlan: { ownFields, lookups },
  relations,
  recordReadRestrictions: {
    unreadableFieldMetadataIds,
    unreadableObjectMetadataIds,
  },
}: {
  formulaFieldEvaluationPlan: FormulaFieldEvaluationPlan;
  relations: CommonSelection['relations'];
  recordReadRestrictions: RecordReadRestrictions;
}): boolean =>
  ownFields.every(
    ({ fieldMetadataId }) => !unreadableFieldMetadataIds.has(fieldMetadataId),
  ) &&
  lookups.every(
    ({ relationFieldName, targetObjectMetadataId, targetFields }) =>
      !unreadableObjectMetadataIds.has(targetObjectMetadataId) &&
      targetFields.every(
        ({ fieldMetadataId }) =>
          !unreadableFieldMetadataIds.has(fieldMetadataId),
      ) &&
      (relations[relationFieldName]?.fieldName ?? relationFieldName) ===
        relationFieldName,
  );

const toSelectedColumns = (columnNames: string[]): Record<string, true> =>
  Object.fromEntries(
    columnNames.map((columnName): [string, true] => [columnName, true]),
  );

const addFormulaFieldDependenciesToRelationSelections = ({
  relations,
  flatObjectMetadata,
  recordReadRestrictions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relations: CommonSelection['relations'];
  flatObjectMetadata: FlatObjectMetadata;
  recordReadRestrictions: RecordReadRestrictions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): CommonSelection['relations'] => {
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    flatObjectMetadata,
  );

  return Object.fromEntries(
    getRelationSelectionEntries({ relations }).map(
      ({ key, relationSelection }): [string, CommonRelationSelection] => {
        const relationTargetObjectMetadataId =
          findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: fieldIdByName[relationSelection.fieldName],
            flatEntityMaps: flatFieldMetadataMaps,
          })?.relationTargetObjectMetadataId;
        const targetFlatObjectMetadata = isDefined(
          relationTargetObjectMetadataId,
        )
          ? findFlatEntityByIdInFlatEntityMaps({
              flatEntityId: relationTargetObjectMetadataId,
              flatEntityMaps: flatObjectMetadataMaps,
            })
          : undefined;

        return [
          key,
          isDefined(targetFlatObjectMetadata)
            ? {
                ...relationSelection,
                selection: addFormulaFieldDependenciesToSelect({
                  selection: relationSelection.selection,
                  flatObjectMetadata: targetFlatObjectMetadata,
                  recordReadRestrictions,
                  flatObjectMetadataMaps,
                  flatFieldMetadataMaps,
                }),
              }
            : relationSelection,
        ];
      },
    ),
  );
};

export const addFormulaFieldDependenciesToSelect = <
  TSelection extends CommonSelection,
>({
  selection,
  flatObjectMetadata,
  recordReadRestrictions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  selection: TSelection;
  flatObjectMetadata: FlatObjectMetadata;
  recordReadRestrictions: RecordReadRestrictions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TSelection => {
  const relations = addFormulaFieldDependenciesToRelationSelections({
    relations: selection.relations,
    flatObjectMetadata,
    recordReadRestrictions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
  const readableFormulaFieldEvaluationPlans = getFormulaFieldEvaluationPlans({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }).filter(
    (formulaFieldEvaluationPlan) =>
      formulaFieldEvaluationPlan.columnNames.some((columnName) =>
        isDefined(selection.columns[columnName]),
      ) &&
      canReadFormulaFieldDependencies({
        formulaFieldEvaluationPlan,
        relations,
        recordReadRestrictions,
      }),
  );

  if (readableFormulaFieldEvaluationPlans.length === 0) {
    return { ...selection, relations };
  }

  const columns = {
    ...selection.columns,
    ...toSelectedColumns(
      readableFormulaFieldEvaluationPlans.flatMap(({ ownFields }) =>
        ownFields.flatMap(({ columnNames }) => columnNames),
      ),
    ),
  };

  for (const {
    relationFieldName,
    targetFields,
  } of readableFormulaFieldEvaluationPlans.flatMap(({ lookups }) => lookups)) {
    const relationSelection = relations[relationFieldName];

    relations[relationFieldName] = {
      fieldName: relationFieldName,
      ...relationSelection,
      selection: {
        aggregates: {},
        relations: {},
        ...relationSelection?.selection,
        columns: {
          ...relationSelection?.selection.columns,
          ...toSelectedColumns(
            targetFields.flatMap(({ columnNames }) => columnNames),
          ),
        },
      },
    };
  }

  return { ...selection, columns, relations };
};
