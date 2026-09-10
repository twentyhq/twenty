// a thread page asks Slack for up to 1000 replies, which the 3s default cuts short
export const SLACK_ASSISTANT_CONTEXT_REQUEST_TIMEOUT_MS = 10 * 1000;
