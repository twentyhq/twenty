import { PUBLIC_WEB_MAX_EXCERPT_CHARS } from 'src/modules/partner/pre-review/connector/public-web/config';
import {
  fetchPublicWebPage,
  fetchYoutubeCaptionText,
} from 'src/modules/partner/pre-review/connector/public-web/public-web.connector';
import { type PublicWebPage } from 'src/modules/partner/pre-review/connector/public-web/types';
import {
  type EvidenceSource,
  type EvidenceSourceLabel,
  type PartnerForPreReview,
} from 'src/modules/partner/pre-review/types/pre-review.type';
import {
  classifyLink,
  isVideoClassification,
} from 'src/modules/partner/pre-review/utils/classify-link.util';
import { extractOpenGraph } from 'src/modules/partner/pre-review/utils/extract-open-graph.util';
import { extractPageText } from 'src/modules/partner/pre-review/utils/extract-page-text.util';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

const buildFailureReason = (page: PublicWebPage): string | null => {
  if (page.isTimeout) return 'Timed out after 12s';
  if (page.status === null) {
    return `Request failed: ${page.errorMessage ?? 'unknown error'}`;
  }
  if (page.status >= 400) return `HTTP ${page.status}`;

  return null;
};

const buildSource = async (
  label: EvidenceSourceLabel,
  url: string,
): Promise<EvidenceSource> => {
  const page = await fetchPublicWebPage(url);
  const classification = classifyLink({
    url,
    outcome: {
      status: page.status,
      html: page.html,
      isTimeout: page.isTimeout,
    },
  });

  const openGraph = isVideoClassification(classification)
    ? extractOpenGraph(page.html)
    : { title: null, description: null, imageUrl: null };

  const captionExcerpt =
    classification === 'video-youtube' && page.html !== null
      ? await fetchYoutubeCaptionText(page.html)
      : null;

  return {
    label,
    url,
    classification,
    excerpt: isVideoClassification(classification)
      ? null
      : extractPageText(page.html, PUBLIC_WEB_MAX_EXCERPT_CHARS),
    videoTitle: openGraph.title,
    videoDescription: openGraph.description,
    videoThumbnailUrl: openGraph.imageUrl,
    captionExcerpt,
    failureReason: buildFailureReason(page),
  };
};

export const collectPreReviewSources = async (
  partner: PartnerForPreReview,
): Promise<EvidenceSource[]> => {
  const candidates: { label: EvidenceSourceLabel; url: string | null }[] = [
    { label: 'proof', url: partner.proofUrl },
    { label: 'website', url: partner.websiteUrl },
    { label: 'linkedin', url: partner.linkedinUrl },
  ];

  const sources: EvidenceSource[] = [];

  // Sequential on purpose: three fetches at 12s each fit the 300s budget, and a
  // burst of parallel requests from one Lambda IP invites rate limiting.
  for (const { label, url } of candidates) {
    if (!isNonEmptyString(url)) continue;
    sources.push(await buildSource(label, url.trim()));
  }

  return sources;
};
