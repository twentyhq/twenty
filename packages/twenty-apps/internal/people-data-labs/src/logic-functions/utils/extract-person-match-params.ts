import { buildPersonNameParam } from 'src/logic-functions/utils/build-person-name-param';
import { toText } from 'src/logic-functions/utils/to-text';
import { type BulkEnrichInput } from 'src/types/bulk-enrich-input';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { type PersonNode } from 'src/types/person-node';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

const DEFAULT_MIN_LIKELIHOOD = 2;
const WEAK_IDENTIFIER_MIN_LIKELIHOOD = 6;

export const extractPersonMatchParams = (
  node: PersonNode,
  input: BulkEnrichInput,
): PdlPersonEnrichParams | undefined => {
  const existingPdlId = toText(node.pdlId);
  const profile = toText(node.linkedinLink?.primaryLinkUrl);
  const email = toText(node.emails?.primaryEmail);
  const name = buildPersonNameParam(node.name?.firstName, node.name?.lastName);
  const hasStrongIdentifier =
    isDefined(existingPdlId) || isDefined(profile) || isDefined(email);

  const matchParams: PdlPersonEnrichParams = isDefined(existingPdlId)
    ? { pdlId: existingPdlId }
    : pruneUndefined({ profile, email, name });

  if (Object.keys(matchParams).length === 0) {
    return undefined;
  }

  const minLikelihood =
    input.minLikelihood ??
    (hasStrongIdentifier
      ? DEFAULT_MIN_LIKELIHOOD
      : WEAK_IDENTIFIER_MIN_LIKELIHOOD);

  return { ...matchParams, minLikelihood };
};
