import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunnerService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-runner.service';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

@Processor({ queueName: MessageQueue.aiQueue, scope: Scope.REQUEST })
export class ContinueAgentRunJob {
  constructor(
    private readonly agentRunnerService: AgentRunnerService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  @Process(CONTINUE_AGENT_RUN_JOB_NAME)
  async handle(jobData: ContinueAgentRunJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.agentRunnerService.continue(jobData),
      buildSystemAuthContext(jobData.workspaceId),
    );
  }
}
