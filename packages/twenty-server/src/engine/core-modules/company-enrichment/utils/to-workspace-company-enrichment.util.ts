import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-max-tags.constant';
import { WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH } from 'src/engine/core-modules/company-enrichment/constants/workspace-company-enrichment-summary-max-length.constant';
import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';

export const toWorkspaceCompanyEnrichment = ({
  domain,
  data,
  enrichedAt,
}: {
  domain: string;
  data: PeopleDataLabsCompanyData;
  enrichedAt: Date;
}): WorkspaceCompanyEnrichment => ({
  domain,
  enrichedAt: enrichedAt.toISOString(),
  name: data.display_name || data.name || null,
  website: data.website ?? null,
  industry: data.industry ?? null,
  employeeCount: data.employee_count ?? null,
  size: data.size ?? null,
  founded: data.founded ?? null,
  headline: data.headline ?? null,
  summary:
    data.summary?.slice(0, WORKSPACE_COMPANY_ENRICHMENT_SUMMARY_MAX_LENGTH) ??
    null,
  tags: data.tags?.slice(0, WORKSPACE_COMPANY_ENRICHMENT_MAX_TAGS) ?? [],
  locality: data.location?.locality ?? null,
  region: data.location?.region ?? null,
  country: data.location?.country ?? null,
});
