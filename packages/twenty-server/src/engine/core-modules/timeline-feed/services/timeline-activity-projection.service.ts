import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { TimelineActivityProjectionDTO } from 'src/engine/core-modules/timeline-feed/dtos/timeline-activity-projection.dto';
import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';
import { StaticTimelineProjectionPolicyProvider } from 'src/engine/core-modules/timeline-feed/services/static-timeline-projection-policy.provider';
import { buildObjectIdByNameMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/build-object-id-by-name-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Resolves the projection rules into concrete OR clauses for an anchor record:
// for each rule, the ids of related records to inherit from and the metadata ids
// of the activity object types allowed to project. The frontend keeps its
// existing timelineActivity query and just ORs these clauses in.
@Injectable()
export class TimelineActivityProjectionService {
  constructor(
    private readonly relatedRecordIdsService: RelatedRecordIdsService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly policyProvider: StaticTimelineProjectionPolicyProvider,
  ) {}

  async getProjections({
    workspaceId,
    objectNameSingular,
    recordId,
  }: {
    workspaceId: string;
    objectNameSingular: string;
    recordId: string;
  }): Promise<TimelineActivityProjectionDTO[]> {
    const rules = this.policyProvider.getRules();

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const { idByNameSingular } = buildObjectIdByNameMaps(
      flatObjectMetadataMaps,
    );

    const projections: TimelineActivityProjectionDTO[] = [];

    for (const rule of rules) {
      // A record's own direct activities are already served by the base query;
      // projecting a record onto itself would only duplicate them.
      if (rule.targetObjectNameSingular === objectNameSingular) {
        continue;
      }

      const recordIds = await this.relatedRecordIdsService.getRelatedRecordIds({
        workspaceId,
        fromObjectNameSingular: objectNameSingular,
        toObjectNameSingular: rule.targetObjectNameSingular,
        recordId,
      });

      if (recordIds.length === 0) {
        continue;
      }

      const linkedObjectMetadataIds = rule.linkedObjectNameSingulars
        .map((nameSingular) => idByNameSingular[nameSingular])
        .filter(isDefined);

      if (linkedObjectMetadataIds.length === 0) {
        continue;
      }

      projections.push({
        targetColumnName: rule.targetColumnName,
        recordIds,
        linkedObjectMetadataIds,
      });
    }

    return projections;
  }
}
