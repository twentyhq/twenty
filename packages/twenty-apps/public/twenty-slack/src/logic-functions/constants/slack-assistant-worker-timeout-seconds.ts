export const SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS = 60 * 4;

// the worker also posts the placeholder, fetches Slack context and updates the
// message, so the agent gets a shorter budget than the worker timeout
export const SLACK_ASSISTANT_AGENT_BUDGET_SECONDS =
  SLACK_ASSISTANT_WORKER_TIMEOUT_SECONDS - 30;
