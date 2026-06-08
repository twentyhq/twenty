import { postPdlEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichCompany = (
  params: PdlCompanyEnrichParams,
): Promise<PdlEnrichResult<PdlCompanyData>> =>
  postPdlEnrich<PdlCompanyData>(
    '/company/enrich',
    pruneUndefined({
      pdl_id: params.pdlId,
      website: params.website,
      name: params.name,
      ticker: params.ticker,
    }),
  );
