// Transient marker written into the summary while the agent runs. Its presence
// both shows progress in the UI and claims the summary so concurrent webhook
// and cron passes don't summarize the same recording twice.
export const CALL_RECORDING_SUMMARY_PENDING_MARKDOWN = '_Generating summary…_';
