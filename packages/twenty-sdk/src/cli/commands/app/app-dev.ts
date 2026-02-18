import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { renderDevUI } from '@/cli/utilities/dev/ui/components/dev-ui';
import { DevUiStateManager } from '@/cli/utilities/dev/ui/dev-ui-state-manager';
import { DevModeOrchestrator } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator';
import { OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type AppDevOptions = {
  appPath?: string;
};

export class AppDevCommand {
  private orchestrator: DevModeOrchestrator | null = null;
  private unmountUI: (() => void) | null = null;

  async close(): Promise<void> {
    this.unmountUI?.();
    await this.orchestrator?.close();
  }

  async execute(options: AppDevOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    const orchestratorState = new OrchestratorState({
      appPath,
      frontendUrl: process.env.FRONTEND_URL,
    });

    const uiStateManager = new DevUiStateManager(orchestratorState);

    orchestratorState.onChange = () => uiStateManager.notify();

    const { unmount } = await renderDevUI(uiStateManager);

    this.unmountUI = unmount;

    this.orchestrator = new DevModeOrchestrator({
      state: orchestratorState,
    });

    await this.orchestrator.start();
    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => void this.close().then(() => process.exit(0));

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
