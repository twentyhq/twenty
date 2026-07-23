import { companyEnrichmentAdapter } from 'src/logic-functions/handlers/company-enrichment-adapter';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type CompanyNode } from 'src/types/company-node';
import { type PeopleDataLabsCompanyData, type PeopleDataLabsCompanyEnrichParams } from 'twenty-shared/people-data-labs';
export const companySingleEnrichmentAdapter: BatchEnrichmentAdapter<
  CompanyNode,
  PeopleDataLabsCompanyData,
  PeopleDataLabsCompanyEnrichParams
> = {
  ...companyEnrichmentAdapter,
  enrichBatch: enrichCompany,
};
