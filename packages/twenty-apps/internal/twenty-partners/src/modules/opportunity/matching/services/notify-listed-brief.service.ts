import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  DISCORD_WEBHOOK_ENV_VAR,
  TWENTY_BLUE,
} from 'src/modules/shared/connector/discord/config';
import { postWebhook } from 'src/modules/shared/connector/discord/discord.connector';
import {
  inlineField,
  truncate,
  trimTrailingSlash,
} from 'src/modules/shared/connector/discord/embed-text.util';
import { type DiscordField } from 'src/modules/shared/connector/discord/types';
import { getListedBriefDetails } from 'src/modules/opportunity/matching/graphql/queries/get-listed-brief-details';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

const NEED_MAX = 600;
const REQUIREMENTS_MAX = 300;

export async function notifyListedBrief(
  opportunityId: string,
): Promise<boolean> {
  const webhookUrl = process.env[DISCORD_WEBHOOK_ENV_VAR];
  if (!isNonEmptyString(webhookUrl)) return false;

  try {
    const result = await getListedBriefDetails(
      new CoreApiClient(),
      opportunityId,
    );
    const brief = result.opportunities?.edges?.[0]?.node;
    if (!brief) return false;

    const contact = [
      brief.pointOfContact?.name?.firstName,
      brief.pointOfContact?.name?.lastName,
    ]
      .filter(isNonEmptyString)
      .join(' ');
    const fields: DiscordField[] = [
      ...inlineField('Company', brief.company?.name),
      ...inlineField('Contact', contact),
      ...inlineField('Referred by', brief.referredByPartner?.name),
    ];
    if (isNonEmptyString(brief.requirements)) {
      fields.push({
        name: 'Requirements',
        value: truncate(brief.requirements.trim(), REQUIREMENTS_MAX),
      });
    }

    const embed: Record<string, unknown> = {
      title: 'Brief listed on the marketplace',
      description: isNonEmptyString(brief.need)
        ? truncate(brief.need.trim(), NEED_MAX)
        : brief.name,
      color: TWENTY_BLUE,
      timestamp: new Date().toISOString(),
      fields,
    };
    const frontendUrl = process.env.PARTNER_APP_FRONTEND_URL;
    if (isNonEmptyString(frontendUrl)) {
      embed.url = `${trimTrailingSlash(frontendUrl)}/object/opportunity/${brief.id}`;
    }

    return await postWebhook(
      webhookUrl,
      { embeds: [embed] },
      'notify-listed-brief',
    );
  } catch {
    // Best-effort: a read or Discord failure must never fail the trigger.
    return false;
  }
}
