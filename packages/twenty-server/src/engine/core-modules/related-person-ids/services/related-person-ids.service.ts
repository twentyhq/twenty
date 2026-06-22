import { Injectable } from '@nestjs/common';

import { RelatedRecordIdsService } from 'src/engine/core-modules/timeline-feed/projection/services/related-record-ids.service';

const PERSON_OBJECT_NAME_SINGULAR = 'person';

// Thin specialization of the generalized projection engine: "which people are
// reachable from this record" is just "which records of type person". Kept as a
// dedicated service so the messaging/calendar timelines keep their stable API.
@Injectable()
export class RelatedPersonIdsService {
  constructor(
    private readonly relatedRecordIdsService: RelatedRecordIdsService,
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
    return this.relatedRecordIdsService.getRelatedRecordIds({
      workspaceId,
      fromObjectNameSingular: objectNameSingular,
      toObjectNameSingular: PERSON_OBJECT_NAME_SINGULAR,
      recordId,
    });
  }
}
