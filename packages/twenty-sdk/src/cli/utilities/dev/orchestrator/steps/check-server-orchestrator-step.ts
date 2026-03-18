import { type ApiService } from '@/cli/utilities/api/api-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type CheckServerOrchestratorStepOutput = {
  isReady: boolean;
  errorLogged: boolean;
};

export class CheckServerOrchestratorStep {
  private apiService: ApiService;
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    apiService,
    state,
    notify,
  }: {
    apiService: ApiService;
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.apiService = apiService;
    this.state = state;
    this.notify = notify;
  }

  async execute(): Promise<boolean> {
    const step = this.state.steps.checkServer;
    const validateAuth = await this.apiService.validateAuth();

    if (!validateAuth.serverUp) {
      if (!step.output.errorLogged) {
        step.output = { isReady: false, errorLogged: true };
        step.status = 'error';
        this.state.applyStepEvents([
          {
            message:
              'Cannot reach Twenty at localhost:3000.\n\n' +
              '  Start a local server with Docker:\n' +
              '    curl -sL https://raw.githubusercontent.com/twentyhq/twenty/main/packages/twenty-docker/docker-compose.yml -o docker-compose.yml\n' +
              '    docker compose up -d\n\n' +
              '  Or from the monorepo:\n' +
              '    yarn start\n\n' +
              '  Waiting for server...',
            status: 'error',
          },
        ]);
        this.state.updatePipeline({ status: 'error' });
      }

      return false;
    }

    if (!validateAuth.authValid) {
      if (!step.output.errorLogged) {
        step.output = { isReady: false, errorLogged: true };
        step.status = 'error';
        this.state.applyStepEvents([
          {
            message:
              'Authentication failed. Run `twenty remote add --local` to authenticate.',
            status: 'error',
          },
        ]);
        this.state.updatePipeline({ status: 'error' });
      }

      return false;
    }

    const wasReady = step.output.isReady;

    step.output = { isReady: true, errorLogged: false };
    step.status = 'done';

    if (!wasReady) {
      this.notify();
    }

    return true;
  }
}
