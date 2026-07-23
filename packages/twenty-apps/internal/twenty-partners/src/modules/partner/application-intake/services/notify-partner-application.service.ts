import { CoreApiClient } from 'twenty-client-sdk/core';

import { postWebhook } from 'src/modules/partner/application-intake/connector/discord/discord.connector';
import { findPartnerForEmbed } from 'src/modules/partner/application-intake/graphql/queries/find-partner-for-embed';
import {
  buildApplicationEmbed,
  type PartnerForEmbed,
} from 'src/modules/partner/application-intake/mappers/application-embed.mapper';

export async function notifyPartnerApplication(
  partnerId: string,
  webhookUrl: string,
): Promise<Record<string, unknown>> {
  const frontendUrl = process.env.PARTNER_APP_FRONTEND_URL;

  try {
    const client = new CoreApiClient();
    const res = await findPartnerForEmbed(client, partnerId);

    const node = res.partner;
    if (!node) return {};

    const applicantNode = node.persons?.edges?.[0]?.node;
    const partnerForEmbed: PartnerForEmbed = {
      id: partnerId,
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
    const delivered = await postWebhook(webhookUrl, { embeds: [embed] });
    return { notified: delivered };
  } catch {
    // Best-effort: a Discord failure must never fail the trigger.
    return { notified: false };
  }
}
