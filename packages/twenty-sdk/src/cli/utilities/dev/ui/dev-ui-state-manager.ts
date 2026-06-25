import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';

export type DevUiStateListener = (state: OrchestratorState) => void;

export class DevUiStateManager {
  private orchestratorState: OrchestratorState;
  private listeners = new Set<DevUiStateListener>();
  private pendingNotify = false;

  constructor(orchestratorState: OrchestratorState) {
    this.orchestratorState = orchestratorState;
  }

  getSnapshot(): OrchestratorState {
    return this.orchestratorState;
  }

  subscribe(listener: DevUiStateListener): () => void {
    this.listeners.add(listener);
    listener(this.orchestratorState);

    return () => this.listeners.delete(listener);
  }

  notify(): void {
    if (this.pendingNotify) {
      return;
    }

    this.pendingNotify = true;

    queueMicrotask(() => {
      this.pendingNotify = false;

      for (const listener of this.listeners) {
        listener(this.orchestratorState);
      }
    });
  }
}
