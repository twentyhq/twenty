import { TWENTY_BLUE } from 'src/modules/shared/connector/discord/config';
import {
  inlineField,
  truncate,
  trimTrailingSlash,
} from 'src/modules/shared/connector/discord/embed-text.util';
import { type DiscordField } from 'src/modules/shared/connector/discord/types';
import { type SubmitClientBriefInput } from 'src/modules/opportunity/intake/mappers/build-requirements-text.mapper';
import { type ReferringPartner } from 'src/modules/opportunity/intake/services/submit-client-brief.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export type BriefForEmbed = {
  opportunityId: string;
  input: SubmitClientBriefInput;
  referringPartner: ReferringPartner | null;
};

const NEED_MAX = 600;
const REQUIREMENTS_MAX = 300;
const PARTNER_NAME_MAX = 100;
const NO_PARTNER_LABEL = 'Marketplace listing';
const SPACER: DiscordField = { name: '​', value: '​', inline: true };

const HOSTING_LABEL: Record<'CLOUD' | 'SELF_HOSTING', string> = {
  CLOUD: 'Cloud',
  SELF_HOSTING: 'Self-hosting',
};

// Discord packs three inline fields per row, so a group with fewer than three
// would pull the next group's fields up into its row. Pad every group to three.
const pushInlineRow = (target: DiscordField[], row: DiscordField[]): void => {
  if (row.length === 0) return;
  target.push(...row);
  for (let index = row.length; index < 3; index += 1) target.push(SPACER);
};

const buildReferredBy = (
  partner: ReferringPartner | null,
  baseUrl: string | null,
): string => {
  if (partner === null) return NO_PARTNER_LABEL;
  const name = truncate(partner.name, PARTNER_NAME_MAX);
  return baseUrl === null
    ? name
    : `[${name}](${baseUrl}/object/partner/${partner.id})`;
};

export function buildBriefEmbed(
  brief: BriefForEmbed,
  frontendUrl: string | undefined,
): Record<string, unknown> {
  const { input, referringPartner } = brief;
  const baseUrl = isNonEmptyString(frontendUrl)
    ? trimTrailingSlash(frontendUrl)
    : null;
  const fields: DiscordField[] = [];

  fields.push({
    name: 'Referred by',
    value: buildReferredBy(referringPartner, baseUrl),
  });

  const contact = [input.firstName, input.lastName]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();
  pushInlineRow(fields, [
    ...inlineField('Contact', contact),
    ...inlineField('Company', input.companyName),
  ]);

  pushInlineRow(fields, [
    ...inlineField(
      'Hosting',
      input.hostingType && HOSTING_LABEL[input.hostingType],
    ),
    ...inlineField('Seats', input.seatCount),
    ...inlineField('Country', input.country),
  ]);

  pushInlineRow(fields, [
    ...inlineField('Languages', input.languages?.join(', ')),
    ...inlineField('Timeline', input.timeline),
    ...inlineField('Budget', input.budgetRange),
  ]);

  if (isNonEmptyString(input.requirements)) {
    fields.push({
      name: 'Requirements',
      value: truncate(input.requirements.trim(), REQUIREMENTS_MAX),
    });
  }

  const embed: Record<string, unknown> = {
    title: 'New client brief',
    description: truncate(input.need.trim(), NEED_MAX),
    color: TWENTY_BLUE,
    timestamp: new Date().toISOString(),
    fields,
  };
  if (baseUrl !== null) {
    embed.url = `${baseUrl}/object/opportunity/${brief.opportunityId}`;
  }
  return embed;
}
