export const DISCORD_WEBHOOK_ENV_VAR = 'DISCORD_WEBHOOK_URL';

// Generous bound on the Discord call. The trigger runs out-of-band on the
// worker (no user waiting), so this only needs to stay under the function's
// 10s budget — not be tight. Guards against a hung/slow webhook.
export const DISCORD_TIMEOUT_MS = 8000;

// Twenty brand blue (#4a38f5) as a Discord embed integer color.
export const TWENTY_BLUE = 0x4a38f5;
