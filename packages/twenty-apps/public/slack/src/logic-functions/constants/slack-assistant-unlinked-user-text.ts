export const SLACK_ASSISTANT_UNLINKED_USER_TEXT = [
  "I can't answer you here: this workspace only lets me act for Slack accounts linked to a Twenty workspace member, and I couldn't match yours.",
  'I link accounts by matching your Slack email to a workspace member, so this usually means your Slack email differs from your Twenty one, or you are a guest of this Slack workspace. Ask a Twenty admin to link your account and try again.',
].join('\n\n');
