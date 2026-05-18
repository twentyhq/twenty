import { isDefined } from 'twenty-shared/utils';

export const DISCORD_BOT_TOKEN_ENV_VAR = 'DISCORD_BOT_TOKEN';

export const getDiscordBotToken = ():
  | { success: true; botToken: string }
  | { success: false; error: string } => {
  const botToken = process.env[DISCORD_BOT_TOKEN_ENV_VAR];

  if (!isDefined(botToken) || botToken.length === 0) {
    return {
      success: false,
      error:
        'Discord is not configured. Open the Twenty Discord app settings and set the DISCORD_BOT_TOKEN application variable (Developer Portal → Bot tab → Reset Token).',
    };
  }

  return { success: true, botToken };
};
