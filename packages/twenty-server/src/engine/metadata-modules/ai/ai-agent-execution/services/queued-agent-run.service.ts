import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { QUEUED_AGENT_RUN_TTL_SECONDS } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/queued-agent-run-ttl-seconds.const';
import { type QueuedAgentRun } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/queued-agent-run.type';

const getQueuedRunKey = ({
  workspaceId,
  runId,
}: {
  workspaceId: string;
  runId: string;
}) => `agent-run-queued:${workspaceId}:${runId}`;

// A run's turn is written by the worker, so until then the run is known by what queued it
@Injectable()
export class QueuedAgentRunService {
  constructor(private readonly redisClientService: RedisClientService) {}

  async record({
    workspaceId,
    runId,
    queuedRun,
  }: {
    workspaceId: string;
    runId: string;
    queuedRun: QueuedAgentRun;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .set(
        getQueuedRunKey({ workspaceId, runId }),
        JSON.stringify(queuedRun),
        'EX',
        QUEUED_AGENT_RUN_TTL_SECONDS,
      );
  }

  async find({
    workspaceId,
    runId,
  }: {
    workspaceId: string;
    runId: string;
  }): Promise<QueuedAgentRun | null> {
    const payload = await this.redisClientService
      .getClient()
      .get(getQueuedRunKey({ workspaceId, runId }));

    return isDefined(payload) ? (JSON.parse(payload) as QueuedAgentRun) : null;
  }
}
