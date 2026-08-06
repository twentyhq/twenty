export const getSlackSuggestedPromptsKvKey = (channelId: string): string =>
  `slack-suggested-prompts:${channelId}`;
