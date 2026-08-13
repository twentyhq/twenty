// Slack posts interactivity callbacks as application/x-www-form-urlencoded
// with a single `payload` field holding the JSON-encoded interaction payload.
export type SlackInteractivityRequestBody = {
  payload?: string;
};
