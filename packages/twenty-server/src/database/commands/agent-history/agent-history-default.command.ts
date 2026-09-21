import { Command, CommandRunner, Option } from 'nest-commander';
import { AgentHistoryLifecycleService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-lifecycle.service';

@Command({
  name: 'agent-history:set-default',
  description:
    'Choose storage for newly initialized workspaces after the whole fleet supports routing',
})
export class AgentHistoryDefaultCommand extends CommandRunner {
  constructor(private readonly lifecycle: AgentHistoryLifecycleService) {
    super();
  }

  @Option({
    flags: '--storage <storage>',
    required: true,
    description: 'core or workspace; existing workspaces are unchanged',
  })
  parseStorage(value: string): 'core' | 'workspace' {
    if (value !== 'core' && value !== 'workspace') {
      throw new Error('Storage must be core or workspace');
    }
    return value;
  }

  @Option({
    flags: '--routing-deployed',
    description:
      'Confirm all API servers, workers and command runners support routing',
  })
  parseRoutingDeployed(): boolean {
    return true;
  }

  override async run(
    _parameters: string[],
    options: { storage: 'core' | 'workspace'; routingDeployed?: boolean },
  ): Promise<void> {
    if (!options.routingDeployed) {
      throw new Error(
        'Deploy routing throughout the fleet first, then pass --routing-deployed',
      );
    }
    await this.lifecycle.setNewWorkspaceDefault(options.storage);
  }
}
