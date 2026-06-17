import { companyEnrichmentAdapter } from 'src/logic-functions/handlers/company-enrichment-adapter';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type CompanyNode } from 'src/types/company-node';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';

export const companySingleEnrichmentAdapter: BatchEnrichmentAdapter<
  CompanyNode,
  PdlCompanyData,
  PdlCompanyEnrichParams
> = {
  ...companyEnrichmentAdapter,
  enrichBatch: enrichCompany,
};
