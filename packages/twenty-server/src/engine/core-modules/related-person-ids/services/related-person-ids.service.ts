import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, type FindOptionsWhere } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import {
  findRelationPathsToPerson,
  type RelationPathToPerson,
} from 'src/engine/core-modules/related-person-ids/utils/find-relation-paths-to-person.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const PERSON_OBJECT_NAME_SINGULAR = 'person';

type RelationWalkRecord = { id: string } & Record<string, unknown>;

@Injectable()
export class RelatedPersonIdsService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getRelatedPersonIds({
    workspaceId,
    objectNameSingular,
    recordId,
  }: {
    workspaceId: string;
    objectNameSingular: string;
    recordId: string;
  }): Promise<string[]> {
    if (objectNameSingular === PERSON_OBJECT_NAME_SINGULAR) {
      return [recordId];
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const relationPaths = findRelationPathsToPerson({
      rootObjectNameSingular: objectNameSingular,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    if (relationPaths.length === 0) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personIds = new Set<string>();

      for (const relationPath of relationPaths) {
        const personIdsForPath = await this.walkRelationPath({
          recordId,
          relationPath,
        });

        personIdsForPath.forEach((personId) => personIds.add(personId));
      }

      return [...personIds];
    }, buildSystemAuthContext(workspaceId));
  }

  private async walkRelationPath({
    recordId,
    relationPath,
  }: {
    recordId: string;
    relationPath: RelationPathToPerson;
  }): Promise<string[]> {
    let currentIds = [recordId];

    for (const hop of relationPath) {
      if (currentIds.length === 0) {
        return [];
      }

      const repository =
        this.workspaceOrmManager.getRepository<RelationWalkRecord>(
          hop.queryObjectNameSingular,
          { shouldBypassPermissionChecks: true },
        );

      if (hop.direction === RelationType.MANY_TO_ONE) {
        const records = await repository.find({
          where: { id: In(currentIds) } as FindOptionsWhere<RelationWalkRecord>,
          select: [hop.joinColumnName],
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
          } as FindOptionsWhere<RelationWalkRecord>,
          select: { id: true },
        });

        currentIds = [...new Set(records.map((record) => record.id))];
      }
    }

    return currentIds;
  }
}
