// Splits onboarding chat traffic in AI telemetry; the ai-digest pipeline in
// twentyhq/twenty-factory filters Sentry spans on this exact string.
export const WORKSPACE_SETUP_CHAT_STREAM_FUNCTION_ID =
  'workspace-setup-chat-stream';
