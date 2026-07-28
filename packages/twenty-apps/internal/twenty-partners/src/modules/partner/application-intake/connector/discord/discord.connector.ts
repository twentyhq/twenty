import { DISCORD_TIMEOUT_MS } from 'src/modules/partner/application-intake/connector/discord/config';
import { type DiscordWebhookPayload } from 'src/modules/partner/application-intake/connector/discord/types';

// Pure outbound transport: POST the payload, honour a hard timeout, and report
// delivery. Holds no decision logic — the caller decides whether to notify.
export async function postWebhook(
  url: string,
  payload: DiscordWebhookPayload,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCORD_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    // fetch only rejects on network errors, not on HTTP error statuses, so a
    // non-2xx (dead webhook, rejected payload, rate limit) must be detected
    // explicitly — otherwise a failed post is reported as delivered.
    if (!response.ok) {
      console.warn(
        `on-partner-application-created: Discord webhook responded ${response.status}`,
      );
      return false;
    }
    return true;
  } finally {
    clearTimeout(timeout);
  }
}
