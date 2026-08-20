// Slack posts interactivity callbacks form-encoded, with the JSON interaction payload in a single `payload` field
export type SlackInteractivityRequestBody = {
  payload?: string;
};
