// What the agent needs left to be worth calling at all; importing past this
// point trades an answer for a deadline error
export const SLACK_ASSISTANT_AGENT_MIN_BUDGET_MS = 60_000;
