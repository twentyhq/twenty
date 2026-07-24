// Pure Tally CSV row → Partner experience update intent.
// Used by the local (uncommitted) raise-bar import ops script.
// Match key is partnerId only — never email.

import { TWENTY_EXPERIENCE_NOTES_MIN_LENGTH } from 'src/modules/partner/constants/partner-option-values.constant';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export { TWENTY_EXPERIENCE_NOTES_MIN_LENGTH };

export const MILESTONE_LABEL_TO_ENUM = {
  'Custom apps': 'CUSTOM_APPS',
  'Data models': 'DATA_MODELS',
  Workflows: 'WORKFLOWS',
  'Front components': 'FRONT_COMPONENTS',
} as const;

export type TwentyExperienceMilestone =
  (typeof MILESTONE_LABEL_TO_ENUM)[keyof typeof MILESTONE_LABEL_TO_ENUM];

export type PartnerExperienceUpdateIntent = {
  partnerId: string;
  twentyExperience: TwentyExperienceMilestone[];
  twentyExperienceNotes: string;
  twentyExperienceProofLink: string;
};

export type MapTallyExperienceCsvRowResult =
  | { ok: true; intent: PartnerExperienceUpdateIntent }
  | { ok: false; reason: string; partnerId?: string };

const PARTNER_ID_HEADER_ALIASES = [
  'partnerid',
  'partner id',
  'partner_id',
  'hidden partnerid',
] as const;

const MILESTONES_HEADER_ALIASES = [
  "what you've built in twenty",
  'what youve built in twenty',
  'twenty experience',
] as const;

const NOTES_HEADER_ALIASES = [
  'tell us about the implementation',
  'twenty experience notes',
] as const;

const PROOF_HEADER_ALIASES = [
  'proof url',
  'twenty experience proof link',
  'proof link',
] as const;

const PARTNER_ID_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const normalizeHeader = (header: string): string =>
  header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getTallyExperienceCsvCell = (
  row: Record<string, string | undefined | null>,
  aliases: readonly string[],
): string | undefined => {
  const normalizedEntries = Object.entries(row).map(([header, value]) => [
    normalizeHeader(header),
    value,
  ]);

  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    for (const [header, value] of normalizedEntries) {
      if (header === normalizedAlias && isNonEmptyString(value)) {
        return value.trim();
      }
    }
  }

  // Partial match for long Tally titles that include helper copy.
  for (const alias of aliases) {
    const normalizedAlias = normalizeHeader(alias);
    for (const [header, value] of normalizedEntries) {
      if (
        header.includes(normalizedAlias) &&
        isNonEmptyString(value) &&
        // Never treat the optional email column as a match/notes/proof cell.
        !header.includes('email')
      ) {
        return value.trim();
      }
    }
  }

  return undefined;
};

export const mapMilestoneLabels = (
  rawMilestones: string,
):
  | { ok: true; milestones: TwentyExperienceMilestone[] }
  | { ok: false; reason: string } => {
  const labels = rawMilestones
    .split(/[,;\n|]+/)
    .map((label) => label.trim())
    .filter((label) => label.length > 0);

  if (labels.length === 0) {
    return { ok: false, reason: 'missing_milestones' };
  }

  const milestones: TwentyExperienceMilestone[] = [];
  const seen = new Set<TwentyExperienceMilestone>();

  for (const label of labels) {
    const mapped =
      MILESTONE_LABEL_TO_ENUM[
        label as keyof typeof MILESTONE_LABEL_TO_ENUM
      ];

    if (mapped === undefined) {
      return { ok: false, reason: `unknown_milestone_label:${label}` };
    }

    if (!seen.has(mapped)) {
      seen.add(mapped);
      milestones.push(mapped);
    }
  }

  return { ok: true, milestones };
};

const isHttpOrHttpsUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const mapTallyExperienceCsvRow = (
  row: Record<string, string | undefined | null>,
): MapTallyExperienceCsvRowResult => {
  const partnerId = getTallyExperienceCsvCell(row, PARTNER_ID_HEADER_ALIASES);

  if (!isNonEmptyString(partnerId)) {
    return { ok: false, reason: 'missing_partner_id' };
  }

  if (!PARTNER_ID_UUID_PATTERN.test(partnerId)) {
    return {
      ok: false,
      reason: 'invalid_partner_id',
      partnerId,
    };
  }

  const rawMilestones = getTallyExperienceCsvCell(row, MILESTONES_HEADER_ALIASES);
  if (!isNonEmptyString(rawMilestones)) {
    return { ok: false, reason: 'missing_milestones', partnerId };
  }

  const mappedMilestones = mapMilestoneLabels(rawMilestones);
  if (!mappedMilestones.ok) {
    return {
      ok: false,
      reason: mappedMilestones.reason,
      partnerId,
    };
  }

  const twentyExperienceNotes = getTallyExperienceCsvCell(
    row,
    NOTES_HEADER_ALIASES,
  );
  if (!isNonEmptyString(twentyExperienceNotes)) {
    return { ok: false, reason: 'missing_notes', partnerId };
  }

  if (twentyExperienceNotes.length < TWENTY_EXPERIENCE_NOTES_MIN_LENGTH) {
    return {
      ok: false,
      reason: `notes_too_short:${twentyExperienceNotes.length}`,
      partnerId,
    };
  }

  const twentyExperienceProofLink = getTallyExperienceCsvCell(
    row,
    PROOF_HEADER_ALIASES,
  );
  if (!isNonEmptyString(twentyExperienceProofLink)) {
    return { ok: false, reason: 'missing_proof_url', partnerId };
  }

  if (!isHttpOrHttpsUrl(twentyExperienceProofLink)) {
    return {
      ok: false,
      reason: 'invalid_proof_url',
      partnerId,
    };
  }

  return {
    ok: true,
    intent: {
      partnerId,
      twentyExperience: mappedMilestones.milestones,
      twentyExperienceNotes,
      twentyExperienceProofLink,
    },
  };
};
