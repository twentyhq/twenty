import { buildPersonNameParam } from 'src/logic-functions/utils/build-person-name-param';
import { resolveMinLikelihood } from 'src/logic-functions/utils/resolve-min-likelihood';
import { toText } from 'src/logic-functions/utils/to-text';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { type PersonNode } from 'src/types/person-node';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const extractPersonMatchParams = ({
  node,
  input,
}: {
  node: PersonNode;
  input: BulkEnrichInput;
}): PdlPersonEnrichParams | undefined => {
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

  const linkedinProfileUrl = toText(node.linkedinLink?.primaryLinkUrl);
  const primaryEmail = toText(node.emails?.primaryEmail);
  const fullName = buildPersonNameParam({
    firstName: node.name?.firstName,
    lastName: node.name?.lastName,
  });
  const companyName = toText(node.company?.name);
  const hasStrongIdentifier =
    isDefined(linkedinProfileUrl) || isDefined(primaryEmail);

  const nameIsUsableAsMatchSignal =
    isDefined(fullName) && (hasStrongIdentifier || isDefined(companyName));

  const personMatchParams = pruneUndefined({
    profile: linkedinProfileUrl,
    email: primaryEmail,
    name: nameIsUsableAsMatchSignal ? fullName : undefined,
    company: nameIsUsableAsMatchSignal ? companyName : undefined,
  });

  if (Object.keys(personMatchParams).length === 0) {
    return undefined;
  }

  return {
    ...personMatchParams,
    minLikelihood: resolveMinLikelihood({
      inputMinLikelihood: input.minLikelihood,
      hasStrongIdentifier,
    }),
  };
};
