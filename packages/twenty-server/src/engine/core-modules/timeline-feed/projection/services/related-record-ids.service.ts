import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, type FindOptionsSelect, type FindOptionsWhere } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  findRelationPaths,
  type RelationPath,
} from 'src/engine/core-modules/timeline-feed/projection/utils/find-relation-paths.util';

type WalkRecord = { id: string } & Record<string, unknown>;

// Given an anchor record, returns the ids of records of `toObjectNameSingular`
// reachable along relation paths — the delivery side of timeline projection.
@Injectable()
export class RelatedRecordIdsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getRelatedRecordIds({
    workspaceId,
    fromObjectNameSingular,
    toObjectNameSingular,
    recordId,
  }: {
    workspaceId: string;
    fromObjectNameSingular: string;
    toObjectNameSingular: string;
    recordId: string;
  }): Promise<string[]> {
    if (fromObjectNameSingular === toObjectNameSingular) {
      return [recordId];
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const relationPaths = findRelationPaths({
      fromObjectNameSingular,
      toObjectNameSingular,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (relationPaths.length === 0) {
      return [];
    }

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const ids = new Set<string>();

        for (const relationPath of relationPaths) {
          const idsForPath = await this.walkRelationPath({
            workspaceId,
            recordId,
            relationPath,
          });

          idsForPath.forEach((id) => ids.add(id));
        }

        return [...ids];
      },
      buildSystemAuthContext(workspaceId),
    );
  }

  private async walkRelationPath({
    workspaceId,
    recordId,
    relationPath,
  }: {
    workspaceId: string;
    recordId: string;
    relationPath: RelationPath;
  }): Promise<string[]> {
    let currentIds = [recordId];

    for (const hop of relationPath) {
      if (currentIds.length === 0) {
        return [];
      }

      const repository =
        await this.globalWorkspaceOrmManager.getRepository<WalkRecord>(
          workspaceId,
          hop.queryObjectNameSingular,
          { shouldBypassPermissionChecks: true },
        );

      if (hop.direction === RelationType.MANY_TO_ONE) {
        const records = await repository.find({
          where: { id: In(currentIds) } as FindOptionsWhere<WalkRecord>,
          select: {
            [hop.joinColumnName]: true,
          } as FindOptionsSelect<WalkRecord>,
        });

        currentIds = [
          ...new Set(
            records
              .map((record) => record[hop.joinColumnName])
              .filter(
                (value): value is string =>
                  typeof value === 'string' && isDefined(value),
              ),
          ),
        ];
      } else {
        const records = await repository.find({
          where: {
            [hop.joinColumnName]: In(currentIds),
          } as FindOptionsWhere<WalkRecord>,
          select: { id: true },
        });

        currentIds = [...new Set(records.map((record) => record.id))];
      }
    }

    return currentIds;
  }
}
