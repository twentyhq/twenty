// A wrong id is invisible: the bot's own join reads as someone else's and the
// welcome silently never fires. registerSlackConnection rewrites the cache on
// every connect, so this only bounds the damage when that write never lands.
export const SLACK_BOT_USER_ID_TTL_MS = 7 * 24 * 60 * 60 * 1000;
