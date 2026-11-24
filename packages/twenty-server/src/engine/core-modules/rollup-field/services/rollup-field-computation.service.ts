import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { CommonQueryParser } from 'src/engine/api/common/common-query-parsers/common-query.parser';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { ROLLUP_FIELD_RECOMPUTE_BATCH_SIZE } from 'src/engine/core-modules/rollup-field/constants/rollup-field-recompute-batch-size.constant';
import { type RollupFieldComputationPlan } from 'src/engine/core-modules/rollup-field/types/rollup-field-computation-plan.type';
import { type RollupValue } from 'src/engine/core-modules/rollup-field/types/rollup-value.type';
import { buildRollupAggregateSqlExpression } from 'src/engine/core-modules/rollup-field/utils/build-rollup-aggregate-sql-expression.util';
import { buildRollupChildRecordFilter } from 'src/engine/core-modules/rollup-field/utils/build-rollup-child-record-filter.util';
import { buildRollupFieldComputationPlans } from 'src/engine/core-modules/rollup-field/utils/build-rollup-field-computation-plans.util';
import { buildRollupValueSqlExpression } from 'src/engine/core-modules/rollup-field/utils/build-rollup-value-sql-expression.util';
import { computeRollupRecordUpdates } from 'src/engine/core-modules/rollup-field/utils/compute-rollup-record-updates.util';
import { getRollupEmptyValue } from 'src/engine/core-modules/rollup-field/utils/get-rollup-empty-value.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RollupFieldComputationPlanWithFilter = RollupFieldComputationPlan & {
  childRecordFilter: ObjectRecordFilter;
};

@Injectable()
export class RollupFieldComputationService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly filterArgProcessorService: FilterArgProcessorService,
  ) {}

  async recomputeRollupFieldsOfRecords({
    workspaceId,
    objectMetadataId,
    recordIds,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    recordIds: string[];
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const resolvedPlans = this.resolveComputationPlans({ objectMetadataId });

      if (!isDefined(resolvedPlans)) {
        return;
      }

      for (const recordIdsBatch of chunk(
        recordIds,
        ROLLUP_FIELD_RECOMPUTE_BATCH_SIZE,
      )) {
        await this.recomputeRecordsBatch({
          ...resolvedPlans,
          recordIds: recordIdsBatch,
          shouldSkipEventEmission: false,
        });
      }
    }, buildSystemAuthContext(workspaceId));
  }

  // Returns the id to resume after, or null once every record of the object is computed
  async recomputeRollupFieldsOfNextRecords({
    workspaceId,
    objectMetadataId,
    rollupFieldMetadataIds,
    afterRecordId,
    batchCount,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    rollupFieldMetadataIds?: string[];
    afterRecordId: string | null;
    batchCount: number;
  }): Promise<string | null> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const resolvedPlans = this.resolveComputationPlans({
        objectMetadataId,
        rollupFieldMetadataIds,
      });

      if (!isDefined(resolvedPlans)) {
        return null;
      }

      const { flatObjectMetadata } = resolvedPlans;
      const recordAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
      const recordIdsQueryBuilder = this.workspaceOrmManager
        .getRepositoryWithoutPermissionChecks(flatObjectMetadata.nameSingular)
        .createQueryBuilder(flatObjectMetadata.nameSingular)
        .select(`${recordAlias}."id"`, 'id')
        .orderBy(`${recordAlias}."id"`, 'ASC')
        .limit(ROLLUP_FIELD_RECOMPUTE_BATCH_SIZE * batchCount);

      if (isDefined(afterRecordId)) {
        recordIdsQueryBuilder.where(`${recordAlias}."id" > :afterRecordId`, {
          afterRecordId,
        });
      }

      const recordIds = (
        await recordIdsQueryBuilder.getRawMany<{ id: string }>()
      ).map(({ id }) => id);

      for (const recordIdsBatch of chunk(
        recordIds,
        ROLLUP_FIELD_RECOMPUTE_BATCH_SIZE,
      )) {
        await this.recomputeRecordsBatch({
          ...resolvedPlans,
          recordIds: recordIdsBatch,
          // A full pass would otherwise fire an update event, webhook and workflow per record
          shouldSkipEventEmission: true,
        });
      }

      return recordIds.length === ROLLUP_FIELD_RECOMPUTE_BATCH_SIZE * batchCount
        ? recordIds[recordIds.length - 1]
        : null;
    }, buildSystemAuthContext(workspaceId));
  }

  private resolveComputationPlans({
    objectMetadataId,
    rollupFieldMetadataIds,
  }: {
    objectMetadataId: string;
    rollupFieldMetadataIds?: string[];
  }):
    | {
        flatObjectMetadata: FlatObjectMetadata;
        plans: RollupFieldComputationPlanWithFilter[];
      }
    | undefined {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      getWorkspaceContext();
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    const plans = buildRollupFieldComputationPlans({
      flatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      rollupFieldMetadataIds,
    });

    if (plans.length === 0) {
      return undefined;
    }

    return {
      flatObjectMetadata,
      plans: plans.map((plan) => ({
        ...plan,
        childRecordFilter: this.filterArgProcessorService.process({
          filter: buildRollupChildRecordFilter({
            settings: plan.rollupFlatFieldMetadata.settings,
            filterFlatFieldMetadatas: findManyFlatEntityByIdInFlatEntityMaps({
              flatEntityIds: plan.rollupFlatFieldMetadata.settings.filters.map(
                ({ fieldMetadataId }) => fieldMetadataId,
              ),
              flatEntityMaps: flatFieldMetadataMaps,
            }),
          }),
          flatObjectMetadata: plan.childFlatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      })),
    };
  }

  private async recomputeRecordsBatch({
    flatObjectMetadata,
    plans,
    recordIds,
    shouldSkipEventEmission,
  }: {
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
    plans: RollupFieldComputationPlanWithFilter[];
    recordIds: string[];
    shouldSkipEventEmission: boolean;
  }): Promise<void> {
    const recordRepository =
      this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
        flatObjectMetadata.nameSingular,
        { shouldSkipEventEmission },
      );
    const recordAlias = escapeIdentifier(flatObjectMetadata.nameSingular);
    const storedValuesQueryBuilder = recordRepository
      .createQueryBuilder(flatObjectMetadata.nameSingular)
      .select(`${recordAlias}."id"`, 'id')
      .where(`${recordAlias}."id" IN (:...recordIds)`, { recordIds });

    for (const { rollupFlatFieldMetadata } of plans) {
      storedValuesQueryBuilder.addSelect(
        buildRollupValueSqlExpression({
          resultType: rollupFlatFieldMetadata.settings.resultType,
          expression: `${recordAlias}.${escapeIdentifier(rollupFlatFieldMetadata.name)}`,
        }),
        rollupFlatFieldMetadata.name,
      );
    }

    const [storedRows, aggregatedValuesByPlan] = await Promise.all([
      storedValuesQueryBuilder.getRawMany<
        { id: string } & Record<string, RollupValue>
      >(),
      Promise.all(
        plans.map((plan) => this.aggregateChildRecords({ plan, recordIds })),
      ),
    ]);
    const computedValuesByRecordId: Record<
      string,
      Record<string, RollupValue>
    > = Object.fromEntries(
      storedRows.map(({ id }) => [
        id,
        Object.fromEntries(
          plans.map(({ rollupFlatFieldMetadata }, planIndex) => [
            rollupFlatFieldMetadata.name,
            aggregatedValuesByPlan[planIndex].get(id) ??
              getRollupEmptyValue(rollupFlatFieldMetadata.settings),
          ]),
        ),
      ]),
    );

    const recordUpdates = computeRollupRecordUpdates({
      storedValuesByRecordId: Object.fromEntries(
        storedRows.map(({ id, ...storedValues }) => [id, storedValues]),
      ),
      computedValuesByRecordId,
    });

    if (recordUpdates.length > 0) {
      await recordRepository.updateMany(recordUpdates);
    }
  }

  private async aggregateChildRecords({
    plan: {
      rollupFlatFieldMetadata,
      childFlatObjectMetadata,
      childJoinColumnName,
      aggregatedColumnName,
      childRecordFilter,
    },
    recordIds,
  }: {
    plan: RollupFieldComputationPlanWithFilter;
    recordIds: string[];
  }): Promise<Map<string, RollupValue>> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      getWorkspaceContext();
    const childObjectNameSingular = childFlatObjectMetadata.nameSingular;
    const parentIdExpression = `${escapeIdentifier(childObjectNameSingular)}.${escapeIdentifier(childJoinColumnName)}`;
    const queryBuilder = this.workspaceOrmManager
      .getRepositoryWithoutPermissionChecks(childObjectNameSingular)
      .createQueryBuilder(childObjectNameSingular)
      .select(parentIdExpression, 'parentRecordId')
      .addSelect(
        buildRollupAggregateSqlExpression({
          settings: rollupFlatFieldMetadata.settings,
          childObjectNameSingular,
          aggregatedColumnName,
        }),
        'value',
      );

    new CommonQueryParser({
      flatObjectMetadata: childFlatObjectMetadata,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }).applyFilterToBuilder({
      queryBuilder,
      objectNameSingular: childObjectNameSingular,
      recordFilter: childRecordFilter,
    });

    const aggregatedRows = await queryBuilder
      .andWhere(`${parentIdExpression} IN (:...recordIds)`, { recordIds })
      .groupBy(parentIdExpression)
      .getRawMany<{ parentRecordId: string; value: RollupValue }>();

    return new Map(
      aggregatedRows.map(({ parentRecordId, value }) => [
        parentRecordId,
        value,
      ]),
    );
  }
}
