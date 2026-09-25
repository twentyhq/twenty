import { COMPANY_MATCH_COST_DOLLARS } from 'src/constants/company-match-cost-dollars';
import { PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-min-likelihood-env-var-name';
import { PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-weak-identifier-min-likelihood-env-var-name';
import { buildCompanyMatchedData } from 'src/logic-functions/utils/build-company-matched-data';
import { enrichCompanies } from 'src/logic-functions/utils/enrich-companies';
import { extractCompanyMatchParams } from 'src/logic-functions/utils/extract-company-match-params';
import { readCompanies } from 'src/logic-functions/utils/read-companies';
import { updateCompaniesStatus } from 'src/logic-functions/utils/update-companies-status';
import { updateCompanyRecord } from 'src/logic-functions/utils/update-company-record';
import { type BatchEnrichmentAdapter } from 'src/types/batch-enrichment-adapter';
import { type CompanyNode } from 'src/types/company-node';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';

export const companyEnrichmentAdapter: BatchEnrichmentAdapter<
  CompanyNode,
  PdlCompanyData,
  PdlCompanyEnrichParams
> = {
  objectNameSingular: 'Company',
  noIdentifierMessage:
    'No usable identifier (domain, LinkedIn, or name) to match against PDL.',
  costPerMatchDollars: COMPANY_MATCH_COST_DOLLARS,
  minLikelihoodEnvVarName: PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME,
  weakIdentifierMinLikelihoodEnvVarName:
    PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
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
