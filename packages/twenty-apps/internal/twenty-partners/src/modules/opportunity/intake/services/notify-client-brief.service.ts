import { DISCORD_WEBHOOK_ENV_VAR } from 'src/modules/shared/connector/discord/config';
import { postWebhook } from 'src/modules/shared/connector/discord/discord.connector';
import { buildBriefEmbed, type BriefForEmbed } from 'src/modules/opportunity/intake/mappers/brief-embed.mapper';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

// Tighter than the trigger-driven default: this runs inside the visitor's
// request, so a hung webhook must not eat the function's 15s budget.
const BRIEF_WEBHOOK_TIMEOUT_MS = 3000;

export async function notifyClientBrief(brief: BriefForEmbed): Promise<void> {
  const webhookUrl = process.env[DISCORD_WEBHOOK_ENV_VAR];
  if (!isNonEmptyString(webhookUrl)) return;

  try {
    const embed = buildBriefEmbed(brief, process.env.PARTNER_APP_FRONTEND_URL);
    await postWebhook(webhookUrl, { embeds: [embed] }, 'submit-client-brief', BRIEF_WEBHOOK_TIMEOUT_MS);
  } catch {
    // Best-effort: a Discord failure must never fail a submitted brief.
  }
}
