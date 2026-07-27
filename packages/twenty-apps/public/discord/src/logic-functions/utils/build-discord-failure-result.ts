import { type DiscordToolResult } from 'src/logic-functions/types/discord-tool-result.type';

export const buildDiscordFailureResult = (
  message: string,
  error: unknown,
): DiscordToolResult => ({
  success: false,
  message,
  error: error instanceof Error ? error.message : 'Discord request failed',
});
