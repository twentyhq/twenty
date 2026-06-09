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
    'No usable identifier (domain or name) to match against PDL.',
  readRecords: readCompanies,
  getNodeId: (node) => node.id,
  getLastEnrichedAt: (node) => node.pdlLastEnrichedAt,
  extractParams: extractCompanyMatchParams,
  enrichBatch: enrichCompanies,
  buildMatchedData: (_client, node, outcome, enrichedAt) =>
    buildCompanyMatchedData(node, outcome, enrichedAt),
  updateOne: updateCompanyRecord,
  updateManyStatus: updateCompaniesStatus,
};
