export const AGENT_TRIGGER_RUN_LIMITS = {
  // Bounds both runaway loops between agents and the credits a trigger can spend
  MAX_RUNS_PER_AGENT_PER_WINDOW: 100,
  WINDOW_MS: 60 * 60 * 1000,
  MAX_EVENTS_PER_BATCHED_RUN: 20,
};
