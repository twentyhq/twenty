// runAgent rejects the whole message past 10 attachments, so the extras are
// dropped here rather than costing the member their answer
export const SLACK_ASSISTANT_MAX_ATTACHMENTS = 10;
