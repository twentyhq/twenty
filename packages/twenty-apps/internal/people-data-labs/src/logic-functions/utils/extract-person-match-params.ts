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

  const profile = toText(node.linkedinLink?.primaryLinkUrl);
  const email = toText(node.emails?.primaryEmail);
  const name = buildPersonNameParam({
    firstName: node.name?.firstName,
    lastName: node.name?.lastName,
  });
  const company = toText(node.company?.name);
  const hasStrongIdentifier = isDefined(profile) || isDefined(email);

  const nameIsUsableAsMatchSignal =
    isDefined(name) && (hasStrongIdentifier || isDefined(company));

  const matchParams = pruneUndefined({
    profile,
    email,
    name: nameIsUsableAsMatchSignal ? name : undefined,
    company: nameIsUsableAsMatchSignal ? company : undefined,
  });

  if (Object.keys(matchParams).length === 0) {
    return undefined;
  }

  return {
    ...matchParams,
    minLikelihood: resolveMinLikelihood({
      inputMinLikelihood: input.minLikelihood,
      hasStrongIdentifier,
    }),
  };
};
