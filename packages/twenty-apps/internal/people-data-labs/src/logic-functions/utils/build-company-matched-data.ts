import { isEmptyAddress } from 'src/logic-functions/utils/is-empty-address';
import { isEmptyLinks } from 'src/logic-functions/utils/is-empty-links';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';
import { mapCompany } from 'src/logic-functions/utils/map-company';
import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { type CompanyNode } from 'src/types/company-node';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { pruneUndefined } from 'src/utils/prune-undefined';

const COMPANY_EMPTY_CHECKS = {
  name: isEmptyText,
  domainName: isEmptyLinks,
  linkedinLink: isEmptyLinks,
  address: isEmptyAddress,
};

export const buildCompanyMatchedData = async (
  node: CompanyNode,
  outcome: { data: PdlCompanyData },
  enrichedAt: string,
): Promise<Record<string, unknown>> => {
  const mapped = mapCompany(outcome.data);
  const writableStandard = pickWritableStandard(
    mapped.standard,
    node as unknown as Record<string, unknown>,
    COMPANY_EMPTY_CHECKS,
  );

  return pruneUndefined({
    ...writableStandard,
    ...mapped.pdl,
    pdlRawPayload: outcome.data,
    pdlLastEnrichedAt: enrichedAt,
    pdlEnrichmentStatus: 'MATCHED',
  });
};
