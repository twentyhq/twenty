// Working budget for the chat context, independent of the model window.
// Mature harnesses compact against a ~150-250k working budget rather than the
// raw window (1M-class windows degrade quality and latency long before they
// overflow), so compaction triggers at min(85% of window, this budget).
export const AI_CHAT_WORKING_CONTEXT_BUDGET_TOKENS = 150_000;
