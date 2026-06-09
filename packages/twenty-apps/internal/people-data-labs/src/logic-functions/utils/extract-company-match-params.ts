import { toText } from 'src/logic-functions/utils/to-text';
import { type CompanyNode } from 'src/types/company-node';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const extractCompanyMatchParams = (
  node: CompanyNode,
): PdlCompanyEnrichParams | undefined => {
  const existingPdlId = toText(node.pdlId);
  const website = toText(node.domainName?.primaryLinkUrl);
  const name = toText(node.name);

  const matchParams: PdlCompanyEnrichParams = isDefined(existingPdlId)
    ? { pdlId: existingPdlId }
    : pruneUndefined({ website, name });

  if (Object.keys(matchParams).length === 0) {
    return undefined;
  }

  return matchParams;
};
