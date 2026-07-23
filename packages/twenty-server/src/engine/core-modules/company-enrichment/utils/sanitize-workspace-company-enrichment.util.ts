import { isNonEmptyString, isNumber, isObject } from '@sniptt/guards';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-field-max-length.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-max-tags.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';

const sanitizeText = (
  value: unknown,
  maxLength = WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH,
): string | null =>
  isNonEmptyString(value) ? value.slice(0, maxLength) : null;

export const sanitizeWorkspaceCompanyEnrichment = (
  value: unknown,
): WorkspaceCompanyEnrichment | null => {
  if (!isObject(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const domain = sanitizeText(candidate.domain);
  const enrichedAt = sanitizeText(candidate.enrichedAt);

  if (domain === null || enrichedAt === null) {
    return null;
  }

  return {
    domain,
    enrichedAt,
    name: sanitizeText(candidate.name),
    website: sanitizeText(candidate.website),
    industry: sanitizeText(candidate.industry),
    employeeCount: isNumber(candidate.employeeCount)
      ? candidate.employeeCount
      : null,
    size: sanitizeText(candidate.size),
    founded: isNumber(candidate.founded) ? candidate.founded : null,
    headline: sanitizeText(candidate.headline),
    summary: sanitizeText(
      candidate.summary,
      WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH,
    ),
    tags: Array.isArray(candidate.tags)
      ? candidate.tags
          .filter(isNonEmptyString)
          .slice(0, WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS)
          .map((tag) =>
            tag.slice(0, WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH),
          )
      : [],
    locality: sanitizeText(candidate.locality),
    region: sanitizeText(candidate.region),
    country: sanitizeText(candidate.country),
  };
};
