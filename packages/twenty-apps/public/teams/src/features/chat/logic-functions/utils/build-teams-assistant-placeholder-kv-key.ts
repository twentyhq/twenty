export const buildTeamsAssistantPlaceholderKvKey = ({
  requestId,
}: {
  requestId: string;
}): string => `teams-assistant-placeholder:${requestId}`;
