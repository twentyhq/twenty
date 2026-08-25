import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import {
  type EvidencePack,
  type EvidenceSource,
  type PartnerForPreReview,
} from 'src/modules/partner/pre-review/types/pre-review.type';
import { isVideoClassification } from 'src/modules/partner/pre-review/utils/classify-link.util';

const formatUsd = (amountMicros: number | null): string | null =>
  amountMicros === null ? null : `${Math.round(amountMicros / 1_000_000)} USD`;

const formatList = (values: string[] | null): string | null =>
  values === null || values.length === 0 ? null : values.join(', ');

const line = (label: string, value: string | null): string[] =>
  isNonEmptyString(value) ? [`${label}: ${value}`] : [];

// A live Twenty instance counts wherever it was pasted — an applicant who put
// their instance URL in the website field still gave machine-checkable proof.
const isVerifiableProof = (source: EvidenceSource): boolean => {
  if (source.failureReason !== null) return false;

  switch (source.classification) {
    case 'twenty-instance':
      return true;
    case 'github':
    case 'site':
      return isNonEmptyString(source.excerpt);
    case 'video-youtube':
      return isNonEmptyString(source.captionExcerpt);
    default:
      return false;
  }
};

const buildNeedsHumanLookEntry = (source: EvidenceSource): string | null => {
  if (source.classification === 'linkedin') {
    return `LinkedIn profile — blocked to automated fetch: ${source.url}`;
  }

  if (
    isVideoClassification(source.classification) &&
    !isNonEmptyString(source.captionExcerpt)
  ) {
    return `Video not watched, only its title and description were read: ${source.url}`;
  }

  if (source.classification === 'drive-or-filedrop') {
    return `Shared folder or file drop, contents not read: ${source.url}`;
  }

  if (source.failureReason !== null && source.classification !== 'dead') {
    return `Could not be read (timeout or auth wall): ${source.url}`;
  }

  return null;
};

const buildApplicationSection = (partner: PartnerForPreReview): string[] => [
  '## Application',
  ...line('Name', partner.name),
  ...line(
    'Location',
    [partner.city, partner.country].filter(isNonEmptyString).join(', '),
  ),
  ...line('Type of team', partner.typeOfTeam),
  ...line('Categories', formatList(partner.partnerScope)),
  ...line('Skills', formatList(partner.skills)),
  ...line('Twenty experience', formatList(partner.twentyExperience)),
  ...line('Hourly rate', formatUsd(partner.hourlyRateAmountMicros)),
  ...line(
    'Minimum project budget',
    formatUsd(partner.projectBudgetMinAmountMicros),
  ),
  ...line('Experience notes', partner.twentyExperienceNotes),
  ...line('Application notes', partner.applicationNotes),
  ...line('Website URL', partner.websiteUrl),
  ...line('LinkedIn URL', partner.linkedinUrl),
  ...line('Proof URL', partner.proofUrl),
];

const buildSourceSection = (source: EvidenceSource): string[] => [
  '',
  `## Source: ${source.label}`,
  `URL: ${source.url}`,
  `Classification: ${source.classification}`,
  ...line('Fetch failed', source.failureReason),
  ...line('Video title', source.videoTitle),
  ...line('Video description', source.videoDescription),
  ...line('Video thumbnail URL', source.videoThumbnailUrl),
  ...line('Video captions', source.captionExcerpt),
  ...line('Excerpt', source.excerpt),
];

export const buildEvidencePack = ({
  partner,
  sources,
}: {
  partner: PartnerForPreReview;
  sources: EvidenceSource[];
}): EvidencePack => {
  const sourceLines =
    sources.length === 0
      ? ['', '## Sources', 'No public link was supplied.']
      : sources.flatMap(buildSourceSection);

  const needsHumanLook = sources
    .map(buildNeedsHumanLookEntry)
    .filter(isNonEmptyString);

  return {
    text: [...buildApplicationSection(partner), ...sourceLines].join('\n'),
    hasVerifiableProof: sources.some(isVerifiableProof),
    needsHumanLook,
  };
};
