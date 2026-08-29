export type DiscordField = { name: string; value: string; inline?: boolean };

export type DiscordEmbed = Record<string, unknown>;

export type DiscordWebhookPayload = { embeds: DiscordEmbed[] };
