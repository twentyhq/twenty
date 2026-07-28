import { DISCORD_TIMEOUT_MS } from 'src/modules/shared/connector/discord/config';
import { type DiscordWebhookPayload } from 'src/modules/shared/connector/discord/types';

// Pure outbound transport: POST the payload, honour a hard timeout, and report
// delivery. Holds no decision logic — the caller decides whether to notify.
export async function postWebhook(
  url: string,
  payload: DiscordWebhookPayload,
  label: string,
  timeoutMs: number = DISCORD_TIMEOUT_MS,
): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
      console.warn(`${label}: Discord webhook responded ${response.status}`);
      return false;
    }
    return true;
  } finally {
    clearTimeout(timeout);
  }
}
