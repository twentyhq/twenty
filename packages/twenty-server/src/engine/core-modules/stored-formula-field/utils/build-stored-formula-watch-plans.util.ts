import {
  getFieldMetadataFormulaEvaluation,
  isDefined,
  listFieldMetadataFormulaFieldNodes,
  substituteQueryTimeFormulaReferences,
} from 'twenty-shared/utils';

import {
  type StoredFormulaRecordWatchPlan,
  type StoredFormulaWatchPlans,
} from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';
import { resolveFormulaLookedUpRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-looked-up-relation.util';

type MutableWatchPlan = StoredFormulaRecordWatchPlan & {
  watchedFieldNames: Set<string>;
};

export const buildStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
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
  const findFlatFieldMetadata = (universalIdentifier?: string) =>
    isDefined(universalIdentifier)
      ? findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        })
      : undefined;

  for (const { objectMetadataId, formula } of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (
      getFieldMetadataFormulaEvaluation({ formula }) !== 'STORED' ||
      !isDefined(formula) ||
      !isDefined(flatObjectMetadata)
    ) {
      continue;
    }

    const watchedOwnFieldNames = (watchedOwnFieldNamesByObjectMetadataId[
      objectMetadataId
    ] ??= new Set());

    for (const {
      fieldUniversalIdentifier,
      relationFieldUniversalIdentifier,
    } of listFieldMetadataFormulaFieldNodes({
      formula: substituteQueryTimeFormulaReferences({
        formula,
        fields: buildFormulaFieldDescriptorsFromFlatEntityMaps({
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      }),
    })) {
      const readFlatFieldMetadata = findFlatFieldMetadata(
        fieldUniversalIdentifier,
      );
      const relationFlatFieldMetadata = isDefined(
        relationFieldUniversalIdentifier,
      )
        ? findFlatFieldMetadata(relationFieldUniversalIdentifier)
        : readFlatFieldMetadata;
      const readFieldName = isDefined(relationFieldUniversalIdentifier)
        ? readFlatFieldMetadata?.name
        : undefined;
      const aggregatedRelation = resolveFormulaAggregatedRelation({
        relationFlatFieldMetadata,
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

        [aggregatedRelation.joinColumnName, readFieldName]
          .filter(isDefined)
          .forEach((fieldName) => plan.watchedFieldNames.add(fieldName));

        continue;
      }

      const lookedUpRelation = resolveFormulaLookedUpRelation({
        relationFlatFieldMetadata,
        flatObjectMetadataMaps,
      });

      if (isDefined(relationFlatFieldMetadata)) {
        watchedOwnFieldNames.add(relationFlatFieldMetadata.name);
      }

      if (!isDefined(lookedUpRelation)) {
        continue;
      }

      // Update events may name a changed relation by its join column only
      watchedOwnFieldNames.add(lookedUpRelation.joinColumnName);

      if (isDefined(readFieldName)) {
        getOrCreateWatchPlan({
          kind: 'lookedUp',
          watchedObjectMetadataId: lookedUpRelation.parentFlatObjectMetadata.id,
          objectMetadataId,
          joinColumnName: lookedUpRelation.joinColumnName,
        }).watchedFieldNames.add(readFieldName);
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
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMapsOrm: FlatEntityMaps<OrmFlatFieldMetadata>;
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
  });

  storedFormulaWatchPlansByFlatFieldMetadataMaps.set(
    flatFieldMetadataMapsOrm,
    watchPlans,
  );

  return watchPlans;
};
