export class HealthStateManager {
  private lastKnownState: {
    timestamp: Date;
    // oxlint-disable-next-line @typescripttypescript/no-explicit-any
    details: Record<string, any>;
  } | null = null;

  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
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
