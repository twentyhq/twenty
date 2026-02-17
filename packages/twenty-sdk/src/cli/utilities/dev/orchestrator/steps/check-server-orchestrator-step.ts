import { type ApiService } from '@/cli/utilities/api/api-service';
import {
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type CheckServerOrchestratorStepInput = Record<string, never>;

export type CheckServerOrchestratorStepOutput = {
  isReady: boolean;
  errorLogged: boolean;
};

export type CheckServerOrchestratorStepState = {
  input: CheckServerOrchestratorStepInput;
  output: CheckServerOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class CheckServerOrchestratorStep {
  private apiService: ApiService;

  constructor({ apiService }: { apiService: ApiService }) {
    this.apiService = apiService;
  }

  async execute(
    stepState: Readonly<CheckServerOrchestratorStepOutput>,
  ): Promise<{
    output: CheckServerOrchestratorStepOutput;
    events: OrchestratorStateStepEvent[];
  }> {
    const validateAuth = await this.apiService.validateAuth();

    if (!validateAuth.serverUp) {
      if (!stepState.errorLogged) {
        return {
          output: { isReady: false, errorLogged: true },
          events: [{ message: 'Cannot reach server', status: 'error' }],
        };
      }

      return { output: { ...stepState }, events: [] };
    }

    if (!validateAuth.authValid) {
      if (!stepState.errorLogged) {
        return {
          output: { isReady: false, errorLogged: true },
          events: [{ message: 'Authentication failed', status: 'error' }],
        };
      }

      return { output: { ...stepState }, events: [] };
    }

    return {
      output: { isReady: true, errorLogged: false },
      events: [],
    };
  }
}
