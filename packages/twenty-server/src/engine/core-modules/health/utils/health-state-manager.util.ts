export class HealthStateManager {
  private lastKnownState: {
    timestamp: Date;
    details: Record<string, any>;
  } | null = null;

  updateState(details: Record<string, any>) {
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
