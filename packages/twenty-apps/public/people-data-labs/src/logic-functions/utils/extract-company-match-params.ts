import { normalizeDomain } from 'src/logic-functions/utils/normalize-domain';
import { normalizeLinkedinUrl } from 'src/logic-functions/utils/normalize-linkedin-url';
import { toText } from 'src/logic-functions/utils/to-text';
import { type CompanyNode } from 'src/types/company-node';
import { type MinLikelihoods } from 'src/types/min-likelihoods';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const extractCompanyMatchParams = ({
  node,
  minLikelihoods,
}: {
  node: CompanyNode;
  minLikelihoods: MinLikelihoods;
}): PdlCompanyEnrichParams | undefined => {
  const existingPdlId = toText(node.pdlId);
  if (isDefined(existingPdlId)) {
    return {
      pdlId: existingPdlId,
      minLikelihood: minLikelihoods.strongIdentifierMinLikelihood,
    };
  }

  const websiteDomain = normalizeDomain(node.domainName?.primaryLinkUrl);
  const linkedinProfileUrl = normalizeLinkedinUrl(node.linkedinLink?.primaryLinkUrl);
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
    minLikelihood: hasStrongIdentifier
      ? minLikelihoods.strongIdentifierMinLikelihood
      : minLikelihoods.weakIdentifierMinLikelihood,
  };
};
