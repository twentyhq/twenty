import { isDefined } from 'twenty-shared/utils';

import {
  type StoredFormulaRecordWatchPlan,
  type StoredFormulaWatchPlans,
} from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getCompiledObjectFormulaFields } from 'src/engine/metadata-modules/formula-field/utils/compile-object-formula-fields.util';
import { getFormulaSqlAggregateAlias } from 'src/engine/metadata-modules/formula-field/utils/get-formula-sql-aggregate-alias.util';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';
import { resolveFormulaLookedUpRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-looked-up-relation.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';

type MutableWatchPlan = StoredFormulaRecordWatchPlan & {
  watchedFieldNames: Set<string>;
};

export const buildStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
}): StoredFormulaWatchPlans => {
  const watchPlanByPlanKey = new Map<string, MutableWatchPlan>();
  const relatedRecordWatchPlansByObjectMetadataId: Record<
    string,
    MutableWatchPlan[]
  > = {};
  const lookedUpRecordWatchPlansByObjectMetadataId: Record<
    string,
    MutableWatchPlan[]
  > = {};
  const watchedOwnFieldNamesByObjectMetadataId: Record<
    string,
    Set<string>
  > = {};
  const getOrCreateWatchPlan = ({
    kind,
    watchedObjectMetadataId,
    objectMetadataId,
    joinColumnName,
  }: {
    kind: 'related' | 'lookedUp';
    watchedObjectMetadataId: string;
    objectMetadataId: string;
    joinColumnName: string;
  }): MutableWatchPlan => {
    const plansByObjectMetadataId =
      kind === 'related'
        ? relatedRecordWatchPlansByObjectMetadataId
        : lookedUpRecordWatchPlansByObjectMetadataId;
    const planKey = `${kind}:${watchedObjectMetadataId}:${objectMetadataId}:${joinColumnName}`;
    const existingPlan = watchPlanByPlanKey.get(planKey);

    if (isDefined(existingPlan)) {
      return existingPlan;
    }

    const plan = {
      objectMetadataId,
      joinColumnName,
      watchedFieldNames: new Set<string>(),
    };

    watchPlanByPlanKey.set(planKey, plan);
    (plansByObjectMetadataId[watchedObjectMetadataId] ??= []).push(plan);

    return plan;
  };
  const findFlatFieldMetadata = (fieldMetadataId: string) =>
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const { formulaFields, lookupShapes } = getCompiledObjectFormulaFields({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      schemaName,
    });
    const storedFormulaDependencies = formulaFields
      .filter(({ isStored }) => isStored)
      .map(({ dependencies }) => dependencies);

    if (storedFormulaDependencies.length === 0) {
      continue;
    }

    const objectMetadataId = flatObjectMetadata.id;
    const watchedOwnFieldNames = (watchedOwnFieldNamesByObjectMetadataId[
      objectMetadataId
    ] ??= new Set());

    for (const dependencies of storedFormulaDependencies) {
      const findFieldNamesReadThrough = (alias: string | undefined) =>
        dependencies
          .filter((dependency) => dependency.alias === alias)
          .map(
            ({ fieldMetadataId }) =>
              findFlatFieldMetadata(fieldMetadataId)?.name,
          )
          .filter(isDefined);

      for (const readFlatFieldMetadata of dependencies
        .filter(({ alias }) => alias === COMPUTED_COLUMN_RECORD_ALIAS)
        .map(({ fieldMetadataId }) => findFlatFieldMetadata(fieldMetadataId))
        .filter(isDefined)) {
        const aggregatedRelation = resolveFormulaAggregatedRelation({
          relationFlatFieldMetadata: readFlatFieldMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        });

        if (isDefined(aggregatedRelation)) {
          const plan = getOrCreateWatchPlan({
            kind: 'related',
            watchedObjectMetadataId:
              aggregatedRelation.relatedFlatObjectMetadata.id,
            objectMetadataId,
            joinColumnName: aggregatedRelation.joinColumnName,
          });

          [
            aggregatedRelation.joinColumnName,
            ...findFieldNamesReadThrough(
              getFormulaSqlAggregateAlias(readFlatFieldMetadata.name),
            ),
          ].forEach((fieldName) => plan.watchedFieldNames.add(fieldName));

          continue;
        }

        watchedOwnFieldNames.add(readFlatFieldMetadata.name);

        const lookedUpRelation = resolveFormulaLookedUpRelation({
          relationFlatFieldMetadata: readFlatFieldMetadata,
          flatObjectMetadataMaps,
        });

        if (!isDefined(lookedUpRelation)) {
          continue;
        }

        // Update events may name a changed relation by its join column only
        watchedOwnFieldNames.add(lookedUpRelation.joinColumnName);

        const lookedUpFieldNames = findFieldNamesReadThrough(
          lookupShapes.find(
            ({ relationFieldName }) =>
              relationFieldName === readFlatFieldMetadata.name,
          )?.alias,
        );

        if (lookedUpFieldNames.length === 0) {
          continue;
        }

        const plan = getOrCreateWatchPlan({
          kind: 'lookedUp',
          watchedObjectMetadataId: lookedUpRelation.parentFlatObjectMetadata.id,
          objectMetadataId,
          joinColumnName: lookedUpRelation.joinColumnName,
        });

        lookedUpFieldNames.forEach((fieldName) =>
          plan.watchedFieldNames.add(fieldName),
        );
      }
    }
  }

  return {
    relatedRecordWatchPlansByObjectMetadataId,
    lookedUpRecordWatchPlansByObjectMetadataId,
    watchedOwnFieldNamesByObjectMetadataId,
  };
};

// The cached maps keep their identity until the metadata changes, so the plans are built once per metadata version
const storedFormulaWatchPlansByFlatFieldMetadataMaps = new WeakMap<
  FlatEntityMaps<OrmFlatFieldMetadata>,
  StoredFormulaWatchPlans
>();

export const getStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMapsOrm,
  schemaName,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
}): StoredFormulaWatchPlans => {
  const memoizedWatchPlans = storedFormulaWatchPlansByFlatFieldMetadataMaps.get(
    flatFieldMetadataMapsOrm,
  );

  if (isDefined(memoizedWatchPlans)) {
    return memoizedWatchPlans;
  }

  const watchPlans = buildStoredFormulaWatchPlans({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    schemaName,
  });

  storedFormulaWatchPlansByFlatFieldMetadataMaps.set(
    flatFieldMetadataMapsOrm,
    watchPlans,
  );

  return watchPlans;
};
