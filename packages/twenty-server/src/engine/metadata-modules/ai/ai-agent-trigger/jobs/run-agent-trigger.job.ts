import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { AgentTriggerRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-trigger/services/agent-trigger-runner.service';
import { type RunAgentTriggerJobData } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/run-agent-trigger-job-data.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Processor({ queueName: MessageQueue.aiQueue, scope: Scope.REQUEST })
export class RunAgentTriggerJob {
  constructor(
    private readonly agentTriggerRunnerService: AgentTriggerRunnerService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(RunAgentTriggerJob.name)
  async handle(data: RunAgentTriggerJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.agentTriggerRunnerService.run(data),
      buildSystemAuthContext(data.workspaceId),
    );
  }
}
