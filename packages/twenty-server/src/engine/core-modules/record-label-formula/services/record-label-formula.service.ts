import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { RecordLabelFormulaRelationService } from 'src/engine/core-modules/record-label-formula/services/record-label-formula-relation.service';
import {
  evaluateRecordLabelFormula,
  getRecordLabelFormulaDefinition,
  getRecordLabelFormulaReferencedFieldMetadatas,
} from 'src/engine/core-modules/record-label-formula/utils/record-label-formula-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const RECORD_BACKFILL_BATCH_SIZE = 500;

type RecordLabelFormulaRecomputeArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  recordIds: string[];
  workspaceDataSource: GlobalWorkspaceDataSource;
};

@Injectable()
export class RecordLabelFormulaService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordLabelFormulaRelationService: RecordLabelFormulaRelationService,
  ) {}

  async recomputeAffectedRecordLabels({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    recordIds,
    workspaceDataSource,
  }: RecordLabelFormulaRecomputeArgs): Promise<Map<string, string>> {
    if (recordIds.length === 0) {
      return new Map();
    }

    const startingObjectRecordLabels = new Map<string, string>();
    const visitedObjectRecordKeys = new Set<string>();
    const queue: Array<{
      flatObjectMetadata: FlatObjectMetadata;
      recordIds: string[];
      isStartingObject: boolean;
    }> = [
      {
        flatObjectMetadata,
        recordIds,
        isStartingObject: true,
      },
    ];

    while (queue.length > 0) {
      const next = queue.shift();

      if (!isDefined(next)) {
        continue;
      }

      const unvisitedRecordIds = [...new Set(next.recordIds)].filter(
        (recordId) =>
          !visitedObjectRecordKeys.has(
            `${next.flatObjectMetadata.id}:${recordId}`,
          ),
      );

      if (unvisitedRecordIds.length === 0) {
        continue;
      }

      unvisitedRecordIds.forEach((recordId) =>
        visitedObjectRecordKeys.add(
          `${next.flatObjectMetadata.id}:${recordId}`,
        ),
      );

      const recomputedLabels = await this.recomputeObjectRecordLabels({
        flatFieldMetadataMaps,
        flatObjectMetadata: next.flatObjectMetadata,
        flatObjectMetadataMaps,
        recordIds: unvisitedRecordIds,
        workspaceDataSource,
      });

      if (next.isStartingObject) {
        recomputedLabels.forEach((label, recordId) =>
          startingObjectRecordLabels.set(recordId, label),
        );
      }

      const dependentRecords = await this.findDependentFormulaRecords({
        changedObjectMetadata: next.flatObjectMetadata,
        changedRecordIds: unvisitedRecordIds,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        workspaceDataSource,
      });

      queue.push(
        ...dependentRecords.map((dependentRecord) => ({
          ...dependentRecord,
          isStartingObject: false,
        })),
      );
    }

    return startingObjectRecordLabels;
  }

  async recomputeForFieldMetadataChange({
    fieldMetadataUniversalIdentifier,
    workspaceId,
  }: {
    fieldMetadataUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const affectedObjectMetadatas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) => {
        if (
          flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
          fieldMetadataUniversalIdentifier
        ) {
          return true;
        }

        const formulaDefinition = getRecordLabelFormulaDefinition({
          flatFieldMetadataMaps,
          flatObjectMetadata,
        });

        if (!isDefined(formulaDefinition)) {
          return false;
        }

        return formulaDefinition.formula.fieldReferences.some(
          (fieldReference) =>
            fieldReference.fieldMetadataUniversalIdentifiers.includes(
              fieldMetadataUniversalIdentifier,
            ),
        );
      });

    if (affectedObjectMetadatas.length === 0) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        for (const affectedObjectMetadata of affectedObjectMetadatas) {
          await this.recomputeAllObjectRecordLabels({
            flatFieldMetadataMaps,
            flatObjectMetadata: affectedObjectMetadata,
            flatObjectMetadataMaps,
            workspaceDataSource,
          });
        }
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  async recomputeForObjectMetadataChange({
    objectMetadataUniversalIdentifier,
    workspaceId,
  }: {
    objectMetadataUniversalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      return;
    }

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        await this.recomputeAllObjectRecordLabels({
          flatFieldMetadataMaps,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          workspaceDataSource,
        });
      },
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }

  private async recomputeAllObjectRecordLabels({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    workspaceDataSource,
  }: Omit<RecordLabelFormulaRecomputeArgs, 'recordIds'>): Promise<void> {
    const repository = workspaceDataSource.getRepository(
      flatObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );
    let lastRecordId: string | undefined;

    while (true) {
      const queryBuilder = repository
        .createQueryBuilder(flatObjectMetadata.nameSingular)
        .select(`${flatObjectMetadata.nameSingular}.id`, 'id')
        .orderBy(`${flatObjectMetadata.nameSingular}.id`, 'ASC')
        .take(RECORD_BACKFILL_BATCH_SIZE);

      if (isDefined(lastRecordId)) {
        queryBuilder.andWhere(
          `${flatObjectMetadata.nameSingular}.id > :lastRecordId`,
          { lastRecordId },
        );
      }

      const records = (await queryBuilder.getRawMany()) as Array<{
        id: string;
      }>;

      if (records.length === 0) {
        break;
      }

      const recordIds = records.map(({ id }) => id);

      await this.recomputeAffectedRecordLabels({
        flatFieldMetadataMaps,
        flatObjectMetadata,
        flatObjectMetadataMaps,
        recordIds,
        workspaceDataSource,
      });

      lastRecordId = recordIds[recordIds.length - 1];
    }
  }

  private async recomputeObjectRecordLabels({
    flatFieldMetadataMaps,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    recordIds,
    workspaceDataSource,
  }: RecordLabelFormulaRecomputeArgs): Promise<Map<string, string>> {
    const formulaDefinition = getRecordLabelFormulaDefinition({
      flatFieldMetadataMaps,
      flatObjectMetadata,
    });

    if (!isDefined(formulaDefinition)) {
      return new Map();
    }

    const referencedFieldMetadatas =
      getRecordLabelFormulaReferencedFieldMetadatas({
        flatFieldMetadataMaps,
        formula: formulaDefinition.formula,
      });
    const relationFieldMetadatas = referencedFieldMetadatas.filter(
      (fieldMetadata) => fieldMetadata.type === FieldMetadataType.RELATION,
    );
    const sourceFieldNames = referencedFieldMetadatas.map((fieldMetadata) =>
      fieldMetadata.type === FieldMetadataType.RELATION
        ? computeMorphOrRelationFieldJoinColumnName({
            name: fieldMetadata.name,
          })
        : fieldMetadata.name,
    );
    const repository = workspaceDataSource.getRepository(
      flatObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );
    const records = (await repository.find({
      select: ['id', ...new Set(sourceFieldNames)],
      where: { id: In(recordIds) },
    })) as ObjectRecord[];
    const relationRecordLabels =
      await this.recordLabelFormulaRelationService.loadRelationRecordLabels({
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        records,
        relationFieldMetadatas,
        workspaceDataSource,
      });
    const updates: Array<{
      criteria: string;
      partialEntity: Partial<ObjectRecord>;
    }> = [];
    const recomputedLabels = new Map<string, string>();

    for (const record of records) {
      const label = evaluateRecordLabelFormula({
        flatFieldMetadataMaps,
        formula: formulaDefinition.formula,
        record,
        relationRecordLabels,
      });

      recomputedLabels.set(record.id, label);
      updates.push({
        criteria: record.id,
        partialEntity: {
          [formulaDefinition.labelIdentifierFieldMetadata.name]: label,
        },
      });
    }

    if (updates.length > 0) {
      await repository.updateMany(updates);
    }

    return recomputedLabels;
  }

  private async findDependentFormulaRecords({
    changedObjectMetadata,
    changedRecordIds,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    workspaceDataSource,
  }: {
    changedObjectMetadata: FlatObjectMetadata;
    changedRecordIds: string[];
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceDataSource: GlobalWorkspaceDataSource;
  }): Promise<
    Array<{ flatObjectMetadata: FlatObjectMetadata; recordIds: string[] }>
  > {
    const dependentRecords: Array<{
      flatObjectMetadata: FlatObjectMetadata;
      recordIds: string[];
    }> = [];

    for (const candidateObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      const formulaDefinition = getRecordLabelFormulaDefinition({
        flatFieldMetadataMaps,
        flatObjectMetadata: candidateObjectMetadata,
      });

      if (!isDefined(formulaDefinition)) {
        continue;
      }

      const referencingRelationFields =
        getRecordLabelFormulaReferencedFieldMetadatas({
          flatFieldMetadataMaps,
          formula: formulaDefinition.formula,
        }).filter(
          (fieldMetadata) =>
            fieldMetadata.type === FieldMetadataType.RELATION &&
            fieldMetadata.relationTargetObjectMetadataId ===
              changedObjectMetadata.id,
        );

      if (referencingRelationFields.length === 0) {
        continue;
      }

      const repository = workspaceDataSource.getRepository(
        candidateObjectMetadata.nameSingular,
        { shouldBypassPermissionChecks: true },
      );
      const dependentRecordIds = new Set<string>();

      for (const relationFieldMetadata of referencingRelationFields) {
        const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
          name: relationFieldMetadata.name,
        });
        const records = (await repository.find({
          select: ['id'],
          where: { [joinColumnName]: In(changedRecordIds) },
        })) as Array<{ id: string }>;

        records.forEach(({ id }) => dependentRecordIds.add(id));
      }

      if (dependentRecordIds.size > 0) {
        dependentRecords.push({
          flatObjectMetadata: candidateObjectMetadata,
          recordIds: [...dependentRecordIds],
        });
      }
    }

    return dependentRecords;
  }
}
