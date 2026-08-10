import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-field-max-length.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-max-tags.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

const CONTROL_CHARACTERS_EXCEPT_LINE_BREAKS_PATTERN =
  /[\u0000-\u0009\u000b-\u001f\u007f\u0080-\u009f]+/g;

const sanitizeSingleLineText = (value: unknown): string | null =>
  sanitizePromptContextLine(
    value,
    WORKSPACE_COMPANY_ENRICHMENT_FIELD_MAX_LENGTH,
  );

const sanitizeSummaryText = (value: unknown): string | null => {
  if (!isNonEmptyString(value)) {
    return null;
  }

  const cleanedValue = value
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL_CHARACTERS_EXCEPT_LINE_BREAKS_PATTERN, ' ')
    .trim();

  return isNonEmptyString(cleanedValue)
    ? cleanedValue.slice(0, WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH)
    : null;
};

const sanitizeFiniteNumber = (value: unknown): number | null =>
  isNumber(value) && Number.isFinite(value) ? value : null;

export const sanitizeWorkspaceCompanyEnrichment = (
  value: unknown,
): WorkspaceCompanyEnrichment | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const domain = sanitizeSingleLineText(value.domain);
  const enrichedAt = sanitizeSingleLineText(value.enrichedAt);

  if (domain === null || enrichedAt === null) {
    return null;
  }

  return {
    domain,
    enrichedAt,
    name: sanitizeSingleLineText(value.name),
    website: sanitizeSingleLineText(value.website),
    industry: sanitizeSingleLineText(value.industry),
    employeeCount: sanitizeFiniteNumber(value.employeeCount),
    size: sanitizeSingleLineText(value.size),
    founded: sanitizeFiniteNumber(value.founded),
    headline: sanitizeSingleLineText(value.headline),
    summary: sanitizeSummaryText(value.summary),
    tags: Array.isArray(value.tags)
      ? value.tags
          .map((tag) => sanitizeSingleLineText(tag))
          .filter(isNonEmptyString)
          .slice(0, WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS)
      : [],
    locality: sanitizeSingleLineText(value.locality),
    region: sanitizeSingleLineText(value.region),
    country: sanitizeSingleLineText(value.country),
  };
};
