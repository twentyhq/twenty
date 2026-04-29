import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { DevModeOrchestrator } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator';
import { OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { renderDevUI } from '@/cli/utilities/dev/ui/components/dev-ui';
import { DevUiStateManager } from '@/cli/utilities/dev/ui/dev-ui-state-manager';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';

export type AppDevOptions = {
  appPath?: string;
  headless?: boolean;
  verbose?: boolean;
};

export class AppDevCommand {
  private orchestrator: DevModeOrchestrator | null = null;
  private unmountUI: (() => void) | null = null;

  async close(): Promise<void> {
    this.unmountUI?.();
    await this.orchestrator?.close();
  }

  getOrchestrator(): DevModeOrchestrator | null {
    return this.orchestrator;
  }

  async execute(options: AppDevOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    const config = await new ConfigService().getConfig();

    const orchestratorState = new OrchestratorState({
      appPath,
      frontendUrl: config.apiUrl,
    });

    if (!options.headless) {
      const uiStateManager = new DevUiStateManager(orchestratorState);

      orchestratorState.onChange = () => uiStateManager.notify();

      const { unmount } = await renderDevUI(uiStateManager);

      this.unmountUI = unmount;
    }

    this.orchestrator = new DevModeOrchestrator({
      state: orchestratorState,
      verbose: options.verbose,
    });

    await this.orchestrator.start();

    if (!options.headless) {
      this.setupGracefulShutdown();
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = () => void this.close().then(() => process.exit(0));

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}
