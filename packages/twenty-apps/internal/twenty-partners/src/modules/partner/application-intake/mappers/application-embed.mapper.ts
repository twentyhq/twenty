import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { TWENTY_BLUE } from 'src/modules/partner/application-intake/connector/discord/config';
import { type DiscordField } from 'src/modules/partner/application-intake/connector/discord/types';

export type PartnerForEmbed = {
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
