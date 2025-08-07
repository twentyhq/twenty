export class HealthStateManager {
  private lastKnownState: {
    timestamp: Date;
    details: Record<string, unknown>;
  } | null = null;

  updateState(details: Record<string, unknown>) {
    this.lastKnownState = {
      timestamp: new Date(),
      details,
    };
  }

  getStateWithAge() {
    return this.lastKnownState
      ? {
          ...this.lastKnownState,
          age: Date.now() - this.lastKnownState.timestamp.getTime(),
        }
      : 'No previous state available';
  }
}
