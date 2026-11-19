import { type ConditionalAvailabilityReadResult } from '@/conditional-availability/types/ConditionalAvailabilityReadResult';
import { getConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/utils/getConditionalAvailabilityOfferedSubjects';
import { toConditionalAvailabilityRowTree } from '@/conditional-availability/utils/toConditionalAvailabilityRowTree';
import { validateConditionalAvailabilityRules } from '@/conditional-availability/utils/validateConditionalAvailabilityRules';
import {
  type ConditionalAvailabilityMetadataName,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const readConditionalAvailabilityNode = ({
  node,
  metadataName,
}: {
  node: ConditionalAvailabilityNode | null | undefined;
  metadataName: ConditionalAvailabilityMetadataName;
}): ConditionalAvailabilityReadResult => {
  if (!isDefined(node)) {
    return { status: 'empty' };
  }

  const tree = toConditionalAvailabilityRowTree({
    node,
    offeredSubjects: getConditionalAvailabilityOfferedSubjects({
      metadataName,
    }),
  });

  if (!isDefined(tree)) {
    return { status: 'unsupported' };
  }

  const rulesValidation = validateConditionalAvailabilityRules({
    tree,
    metadataName,
  });

  return rulesValidation.status === 'valid' &&
    isDeeplyEqual(rulesValidation.node, node)
    ? { status: 'rows', tree }
    : { status: 'unsupported' };
};
