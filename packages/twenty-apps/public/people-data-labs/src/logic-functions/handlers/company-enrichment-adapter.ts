import { COMPANY_MATCH_COST_DOLLARS } from 'src/constants/company-match-cost-dollars';
import { buildCompanyMatchedData } from 'src/logic-functions/utils/build-company-matched-data';
import { enrichCompanies } from 'src/logic-functions/utils/enrich-companies';
import { extractCompanyMatchParams } from 'src/logic-functions/utils/extract-company-match-params';
import { readCompanies } from 'src/logic-functions/utils/read-companies';
import { updateCompaniesStatus } from 'src/logic-functions/utils/update-companies-status';
import { updateCompanyRecord } from 'src/logic-functions/utils/update-company-record';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type CompanyNode } from 'src/types/company-node';
import { type PeopleDataLabsCompanyData, type PeopleDataLabsCompanyEnrichParams } from 'twenty-shared/people-data-labs';
export const companyEnrichmentAdapter: BatchEnrichmentAdapter<
  CompanyNode,
  PeopleDataLabsCompanyData,
  PeopleDataLabsCompanyEnrichParams
> = {
  objectNameSingular: 'Company',
  noIdentifierMessage:
    'No usable identifier (domain, LinkedIn, or name) to match against PDL.',
  costPerMatchDollars: COMPANY_MATCH_COST_DOLLARS,
  readRecords: readCompanies,
  getNodeId: (node) => node.id,
  extractParams: extractCompanyMatchParams,
  enrichBatch: enrichCompanies,
  buildMatchedData: ({
    node,
    outcome,
    enrichedAt,
    overrideExistingValues,
    shouldPersist,
  }) =>
    buildCompanyMatchedData({
      node,
      outcome,
      enrichedAt,
      overrideExistingValues,
      shouldPersist,
    }),
  updateOne: updateCompanyRecord,
  updateManyStatus: updateCompaniesStatus,
};
