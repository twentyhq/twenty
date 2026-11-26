import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';

import {
  type StoredFormulaRecordWatchPlan,
  type StoredFormulaWatchPlans,
} from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
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
  const findBoundFlatFieldMetadata = (universalIdentifier?: string) =>
    isDefined(universalIdentifier)
      ? findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        })
      : undefined;

  for (const { objectMetadataId, settings } of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (getFieldMetadataFormulaEvaluation({ settings }) !== 'STORED') {
      continue;
    }

    const bindings = getFieldMetadataFormulaBindings({ settings }) ?? {};
    const watchedOwnFieldNames = (watchedOwnFieldNamesByObjectMetadataId[
      objectMetadataId
    ] ??= new Set());

    for (const [path, universalIdentifier] of Object.entries(bindings)) {
      const [rootSegment, memberSegment] = path.split('.');
      const rootFlatFieldMetadata = findBoundFlatFieldMetadata(
        bindings[rootSegment ?? ''],
      );
      const aggregatedRelation = resolveFormulaAggregatedRelation({
        relationFlatFieldMetadata: rootFlatFieldMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
      const lookedUpRelation = resolveFormulaLookedUpRelation({
        relationFlatFieldMetadata: rootFlatFieldMetadata,
        flatObjectMetadataMaps,
      });
      const boundFieldName =
        findBoundFlatFieldMetadata(universalIdentifier)?.name;

      if (isDefined(aggregatedRelation)) {
        const plan = getOrCreateWatchPlan({
          kind: 'related',
          watchedObjectMetadataId:
            aggregatedRelation.relatedFlatObjectMetadata.id,
          objectMetadataId,
          joinColumnName: aggregatedRelation.joinColumnName,
        });

        plan.watchedFieldNames.add(aggregatedRelation.joinColumnName);

        if (isDefined(memberSegment) && isDefined(boundFieldName)) {
          plan.watchedFieldNames.add(boundFieldName);
        }

        continue;
      }

      if (isDefined(memberSegment)) {
        if (isDefined(lookedUpRelation) && isDefined(boundFieldName)) {
          getOrCreateWatchPlan({
            kind: 'lookedUp',
            watchedObjectMetadataId:
              lookedUpRelation.parentFlatObjectMetadata.id,
            objectMetadataId,
            joinColumnName: lookedUpRelation.joinColumnName,
          }).watchedFieldNames.add(boundFieldName);
        }

        continue;
      }

      if (isDefined(boundFieldName)) {
        watchedOwnFieldNames.add(boundFieldName);
      }

      // Update events may name a changed relation by its join column only
      if (isDefined(lookedUpRelation)) {
        watchedOwnFieldNames.add(lookedUpRelation.joinColumnName);
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
