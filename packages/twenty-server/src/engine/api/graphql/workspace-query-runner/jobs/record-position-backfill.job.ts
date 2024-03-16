import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

import { RecordPositionBackfillService } from 'src/engine/api/graphql/workspace-query-runner/services/record-position-backfill-service';

export type RecordPositionBackfillJobData = {
  workspaceId: string;
  objectMetadata: { nameSingular: string; isCustom: boolean };
  recordId: string;
};

@Injectable()
export class RecordPositionBackfillJob
  implements MessageQueueJob<RecordPositionBackfillJobData>
{
  constructor(
    private readonly recordPositionBackfillService: RecordPositionBackfillService,
  ) {}

  async handle(data: RecordPositionBackfillJobData): Promise<void> {
    this.recordPositionBackfillService.backfill(
      data.workspaceId,
      data.objectMetadata,
      data.recordId,
    );
  }
}
