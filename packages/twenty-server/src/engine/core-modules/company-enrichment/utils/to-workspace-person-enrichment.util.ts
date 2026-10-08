import { type WorkspacePersonEnrichment } from 'twenty-shared/workspace';

import { type PeopleDataLabsPersonData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-person-data.type';
import { sanitizeWorkspacePersonEnrichment } from 'src/engine/core-modules/company-enrichment/utils/sanitize-workspace-person-enrichment.util';

export const toWorkspacePersonEnrichment = ({
  email,
  data,
  enrichedAt,
}: {
  email: string;
  data: PeopleDataLabsPersonData;
  enrichedAt: Date;
}): WorkspacePersonEnrichment | null =>
  sanitizeWorkspacePersonEnrichment({
    email,
    enrichedAt: enrichedAt.toISOString(),
    fullName: data.full_name ?? null,
    jobTitle: data.job_title ?? null,
    jobTitleLevels: data.job_title_levels ?? [],
    jobCompanyName: data.job_company_name ?? null,
    industry: data.industry || data.job_company_industry || null,
    headline: data.headline ?? null,
    linkedinUrl: data.linkedin_url ?? null,
    skills: data.skills ?? [],
    locality: data.location_locality ?? null,
    region: data.location_region ?? null,
    country: data.location_country ?? null,
  });
