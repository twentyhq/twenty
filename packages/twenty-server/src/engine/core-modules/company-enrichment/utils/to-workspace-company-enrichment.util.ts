import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';
import { sanitizeWorkspaceCompanyEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-company-enrichment.util';

export const toWorkspaceCompanyEnrichment = ({
  domain,
  data,
  enrichedAt,
}: {
  domain: string;
  data: PeopleDataLabsCompanyData;
  enrichedAt: Date;
}): WorkspaceCompanyEnrichment | null =>
  sanitizeWorkspaceCompanyEnrichment({
    domain,
    enrichedAt: enrichedAt.toISOString(),
    name: data.display_name || data.name || null,
    website: data.website ?? null,
    industry: data.industry ?? null,
    employeeCount: data.employee_count ?? null,
    size: data.size ?? null,
    founded: data.founded ?? null,
    headline: data.headline ?? null,
    summary: data.summary ?? null,
    tags: data.tags ?? [],
    locality: data.location?.locality ?? null,
    region: data.location?.region ?? null,
    country: data.location?.country ?? null,
  });
