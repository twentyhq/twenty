import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

export type CompanyEnrichmentStoreValue = {
  fetchedAt: string;
  enrichment: WorkspaceCompanyEnrichment | null;
};
