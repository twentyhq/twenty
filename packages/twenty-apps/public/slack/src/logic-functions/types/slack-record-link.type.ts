export type SlackRecordLink = {
  // Exact url from the Slack event, used as the chat.unfurl key
  linkUrl: string;
  // Canonical origin + /object/<name>/<id> url embedded in the card, bounded
  // by construction regardless of what query string the pasted link carried
  recordUrl: string;
  objectNameSingular: string;
  recordId: string;
};
