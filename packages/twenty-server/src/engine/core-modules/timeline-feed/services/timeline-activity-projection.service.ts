import { Injectable } from '@nestjs/common';

import { TimelineActivityProjectionDTO } from 'src/engine/core-modules/timeline-feed/dtos/timeline-activity-projection.dto';
import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';
import { TimelineProjectionPolicyProvider } from 'src/engine/core-modules/timeline-feed/services/timeline-projection-policy.provider';

@Injectable()
export class TimelineActivityProjectionService {
  constructor(
    private readonly relatedRecordIdsService: RelatedRecordIdsService,
    private readonly timelineProjectionPolicyProvider: TimelineProjectionPolicyProvider,
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
    const rules = await this.timelineProjectionPolicyProvider.getResolvedRules({
      workspaceId,
      anchorObjectNameSingular: objectNameSingular,
    });

    const projections: TimelineActivityProjectionDTO[] = [];

    for (const rule of rules) {
      const recordIds = await this.relatedRecordIdsService.getRelatedRecordIds({
        workspaceId,
        fromObjectNameSingular: objectNameSingular,
        toObjectNameSingular: rule.sourceObjectNameSingular,
        recordId,
      });

      if (recordIds.length === 0) {
        continue;
      }

      projections.push({
        targetColumnName: rule.targetColumnName,
        recordIds,
        linkedObjectMetadataIds: rule.linkedObjectMetadataIds,
      });
    }

    return projections;
  }
}
