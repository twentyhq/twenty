import { Logger, Scope } from '@nestjs/common';

import { WorkflowTrigger } from 'src/engine/core-modules/workflows/workflows.interfaces';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';

export type UpdateSubscriptionJobData = {
  workspaceId: string;
  trigger: WorkflowTrigger;
};

@Processor({
  queueName: MessageQueue.workflowQueue,
  scope: Scope.DEFAULT,
})
export class TriggerWorkflowsJob {
  protected readonly logger = new Logger(TriggerWorkflowsJob.name);

  constructor() {}

  @Process(TriggerWorkflowsJob.name)
  async handle(data: UpdateSubscriptionJobData): Promise<void> {
    // TODO: find all the workflow definitions for this workspace that can be triggered with this trigger.
    // TODO: For each of them, start a workflow run.
  }
}
