import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

import { WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-field-max-length.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-job-title-levels.constant';
import { WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS } from 'src/engine/core-modules/company-enrichment/constants/workspace-person-enrichment-max-skills.constant';
import { sanitizePromptContextLineArray } from 'src/utils/sanitize-prompt-context-line-array.util';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

const sanitizeSingleLineText = (value: unknown): string | null =>
  sanitizePromptContextLine(
    value,
    WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
  );

export const sanitizeWorkspacePersonEnrichment = (
  value: unknown,
): WorkspacePersonEnrichment | null => {
  if (!isPlainObject(value)) {
    return null;
  }

  const email = sanitizeSingleLineText(value.email);
  const enrichedAt = sanitizeSingleLineText(value.enrichedAt);

  if (!isDefined(email) || !isDefined(enrichedAt)) {
    return null;
  }

  return {
    email,
    enrichedAt,
    fullName: sanitizeSingleLineText(value.fullName),
    jobTitle: sanitizeSingleLineText(value.jobTitle),
    jobTitleLevels: sanitizePromptContextLineArray({
      value: value.jobTitleLevels,
      maxLength: WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
      maxItems: WORKSPACE_PERSON_ENRICHMENT_MAX_JOB_TITLE_LEVELS,
    }),
    jobCompanyName: sanitizeSingleLineText(value.jobCompanyName),
    industry: sanitizeSingleLineText(value.industry),
    headline: sanitizeSingleLineText(value.headline),
    linkedinUrl: sanitizeSingleLineText(value.linkedinUrl),
    skills: sanitizePromptContextLineArray({
      value: value.skills,
      maxLength: WORKSPACE_PERSON_ENRICHMENT_FIELD_MAX_LENGTH,
      maxItems: WORKSPACE_PERSON_ENRICHMENT_MAX_SKILLS,
    }),
    locality: sanitizeSingleLineText(value.locality),
    region: sanitizeSingleLineText(value.region),
    country: sanitizeSingleLineText(value.country),
  };
};
