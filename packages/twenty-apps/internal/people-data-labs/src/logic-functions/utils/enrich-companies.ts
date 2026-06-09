import { postPdlBulkEnrich } from 'src/logic-functions/utils/post-pdl-enrich';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { type PdlEnrichResult } from 'src/types/pdl-enrich-result';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const enrichCompanies = (
  params: PdlCompanyEnrichParams[],
): Promise<PdlEnrichResult<PdlCompanyData>[]> =>
  postPdlBulkEnrich<PdlCompanyData>({
    path: '/company/enrich/bulk',
    requests: params.map((entry) =>
      pruneUndefined({
        pdl_id: entry.pdlId,
        website: entry.website,
        name: entry.name,
        ticker: entry.ticker,
      }),
    ),
  });
