import {
  getFieldMetadataFormulaBindings,
  getFieldMetadataFormulaEvaluation,
  isDefined,
} from 'twenty-shared/utils';

import {
  type StoredFormulaRelatedRecordWatchPlan,
  type StoredFormulaWatchPlans,
} from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveFormulaAggregatedRelation } from 'src/engine/metadata-modules/formula-field/utils/resolve-formula-aggregated-relation.util';

export const buildStoredFormulaWatchPlans = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): StoredFormulaWatchPlans => {
  const relatedRecordWatchPlanByPlanKey = new Map<
    string,
    StoredFormulaRelatedRecordWatchPlan & { watchedFieldNames: Set<string> }
  >();
  const relatedRecordWatchPlansByObjectMetadataId: Record<
    string,
    StoredFormulaRelatedRecordWatchPlan[]
  > = {};
  const watchedOwnFieldNamesByObjectMetadataId: Record<
    string,
    Set<string>
  > = {};
  const createRelatedRecordWatchPlan = ({
    planKey,
    relatedObjectMetadataId,
    objectMetadataId,
    joinColumnName,
  }: {
    planKey: string;
    relatedObjectMetadataId: string;
    objectMetadataId: string;
    joinColumnName: string;
  }) => {
    const plan = {
      objectMetadataId,
      joinColumnName,
      watchedFieldNames: new Set([joinColumnName]),
    };

    relatedRecordWatchPlanByPlanKey.set(planKey, plan);
    (relatedRecordWatchPlansByObjectMetadataId[relatedObjectMetadataId] ??=
      []).push(plan);

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
      const aggregatedRelation = resolveFormulaAggregatedRelation({
        relationFlatFieldMetadata: findBoundFlatFieldMetadata(
          bindings[rootSegment ?? ''],
        ),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });
      const boundFieldName =
        findBoundFlatFieldMetadata(universalIdentifier)?.name;

      if (!isDefined(aggregatedRelation)) {
        if (!isDefined(memberSegment) && isDefined(boundFieldName)) {
          watchedOwnFieldNames.add(boundFieldName);
        }

        continue;
      }

      const { relatedFlatObjectMetadata, joinColumnName } = aggregatedRelation;
      const planKey = `${relatedFlatObjectMetadata.id}:${objectMetadataId}:${joinColumnName}`;
      const plan =
        relatedRecordWatchPlanByPlanKey.get(planKey) ??
        createRelatedRecordWatchPlan({
          planKey,
          relatedObjectMetadataId: relatedFlatObjectMetadata.id,
          objectMetadataId,
          joinColumnName,
        });

      if (isDefined(memberSegment) && isDefined(boundFieldName)) {
        plan.watchedFieldNames.add(boundFieldName);
      }
    }
  }

  return {
    relatedRecordWatchPlansByObjectMetadataId,
    watchedOwnFieldNamesByObjectMetadataId,
  };
};
