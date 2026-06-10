import { resolveMinLikelihood } from 'src/logic-functions/utils/resolve-min-likelihood';
import { toText } from 'src/logic-functions/utils/to-text';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type CompanyNode } from 'src/types/company-node';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const extractCompanyMatchParams = ({
  node,
  input,
}: {
  node: CompanyNode;
  input: BulkEnrichInput;
}): PdlCompanyEnrichParams | undefined => {
  const existingPdlId = toText(node.pdlId);
  if (isDefined(existingPdlId)) {
    return {
      pdlId: existingPdlId,
      minLikelihood: resolveMinLikelihood({
        inputMinLikelihood: input.minLikelihood,
        hasStrongIdentifier: true,
      }),
    };
  }

  const websiteDomain = toText(node.domainName?.primaryLinkUrl);
  const linkedinProfileUrl = toText(node.linkedinLink?.primaryLinkUrl);
  const companyName = toText(node.name);
  const hasStrongIdentifier =
    isDefined(websiteDomain) || isDefined(linkedinProfileUrl);

  const companyMatchParams = pruneUndefined({
    website: websiteDomain,
    profile: linkedinProfileUrl,
    name: companyName,
  });

  if (Object.keys(companyMatchParams).length === 0) {
    return undefined;
  }

  return {
    ...companyMatchParams,
    minLikelihood: resolveMinLikelihood({
      inputMinLikelihood: input.minLikelihood,
      hasStrongIdentifier,
    }),
  };
};
