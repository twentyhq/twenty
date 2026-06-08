import { CoreApiClient } from 'twenty-client-sdk/core';
import { type DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';

import { ON_PARTNER_APPLICATION_CREATED_FN_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// Generous bound on the Discord call. The trigger runs out-of-band on the
// worker (no user waiting), so this only needs to stay under the function's
// 10s budget — not be tight. Guards against a hung/slow webhook.
const DISCORD_TIMEOUT_MS = 8000;
// Twenty brand blue (#4a38f5) as a Discord embed integer color.
const TWENTY_BLUE = 0x4a38f5;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

type DiscordField = { name: string; value: string; inline?: boolean };

type PartnerForEmbed = {
  id: string;
  name?: string | null;
  country?: string | null;
  partnerScope?: string[] | null;
  skills?: string[] | null;
  languagesSpoken?: string[] | null;
  applicant?: {
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

// Pure embed builder, exported for unit testing. Empty fields are omitted.
export function buildApplicationEmbed(
  partner: PartnerForEmbed,
  frontendUrl: string | undefined,
): Record<string, unknown> {
  // Discord packs up to 3 inline fields per row. We want two paired rows —
  // Applicant | Company, then Country | Languages — followed by two full-width
  // rows (Partner scope, Skills). A trailing zero-width inline "spacer" fills
  // each paired row to 3 columns so the next group starts on its own line.
  const SPACER: DiscordField = { name: '​', value: '​', inline: true };
  const fields: DiscordField[] = [];

  const applicantName = [partner.applicant?.firstName, partner.applicant?.lastName]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  const pairedRow1: DiscordField[] = [];
  if (isNonEmptyString(applicantName)) {
    pairedRow1.push({ name: 'Applicant', value: applicantName, inline: true });
  }
  if (isNonEmptyString(partner.name)) {
    pairedRow1.push({ name: 'Company', value: partner.name.trim(), inline: true });
  }

  const pairedRow2: DiscordField[] = [];
  if (isNonEmptyString(partner.country)) {
    pairedRow2.push({ name: 'Country', value: partner.country, inline: true });
  }
  if (partner.languagesSpoken && partner.languagesSpoken.length > 0) {
    pairedRow2.push({ name: 'Languages', value: partner.languagesSpoken.join(', '), inline: true });
  }

  for (const field of pairedRow1) fields.push(field);
  if (pairedRow1.length > 0) fields.push(SPACER);
  for (const field of pairedRow2) fields.push(field);
  if (pairedRow2.length > 0) fields.push(SPACER);

  if (partner.partnerScope && partner.partnerScope.length > 0) {
    fields.push({ name: 'Partner scope', value: partner.partnerScope.join(', ') });
  }
  if (partner.skills && partner.skills.length > 0) {
    fields.push({ name: 'Skills', value: partner.skills.join(', ') });
  }

  const embed: Record<string, unknown> = {
    title: 'New partner application',
    color: TWENTY_BLUE,
    timestamp: new Date().toISOString(),
    fields,
  };
  if (isNonEmptyString(frontendUrl)) {
    embed.url = `${frontendUrl.replace(/\/+$/, '')}/object/partner/${partner.id}`;
  }
  return embed;
}

// The event 'after' hydrates the actor composite as a NESTED object
// (after.createdBy.source), verified from the live partner.created payload.
type PartnerCreatedAfter = {
  id: string;
  createdBy?: { source?: string | null } | null;
};

export const handler = async (
  payload: DatabaseEventPayload,
): Promise<Record<string, unknown>> => {
  const after = (payload?.properties as { after?: PartnerCreatedAfter } | undefined)?.after;
  if (!after?.id) return {};

  // Form-only: the installed app stamps createdBy.source = 'APPLICATION'.
  // Seed/import authenticate via API key (API); the UI is MANUAL — both skipped.
  if (after.createdBy?.source !== 'APPLICATION') return {};

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!isNonEmptyString(webhookUrl)) return {};
  const frontendUrl = process.env.PARTNER_APP_FRONTEND_URL;

  try {
    const client = new CoreApiClient();
    const res = await client.query({
      partner: {
        __args: { filter: { id: { eq: after.id } } },
        id: true,
        name: true,
        country: true,
        partnerScope: true,
        skills: true,
        languagesSpoken: true,
        persons: {
          edges: {
            node: {
              name: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    const node = res.partner;
    if (!node) return {};

    const applicantNode = node.persons?.edges?.[0]?.node;
    const partnerForEmbed: PartnerForEmbed = {
      id: after.id,
      name: node.name,
      country: node.country,
      partnerScope: node.partnerScope,
      skills: node.skills,
      languagesSpoken: node.languagesSpoken,
      applicant: applicantNode
        ? {
            firstName: applicantNode.name?.firstName,
            lastName: applicantNode.name?.lastName,
          }
        : null,
    };

    const embed = buildApplicationEmbed(partnerForEmbed, frontendUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DISCORD_TIMEOUT_MS);
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    return { notified: true };
  } catch {
    // Best-effort: a Discord failure must never fail the trigger.
    return { notified: false };
  }
};

export default defineLogicFunction({
  universalIdentifier: ON_PARTNER_APPLICATION_CREATED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-partner-application-created',
  description:
    'Posts a Discord notification when the partner application form creates a new Partner.',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'partner.created',
  },
});
