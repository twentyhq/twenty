import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import {
  isDefined,
  listConditionalAvailabilityNodes,
} from 'twenty-shared/utils';

export const getConditionalAvailabilityNodeVariableRoots = ({
  node,
}: {
  node: ConditionalAvailabilityNode | null;
}): string[] => {
  if (!isDefined(node)) {
    return [];
  }

  return listConditionalAvailabilityNodes({ node }).flatMap((childNode) =>
    childNode.type === 'PATH' ? [childNode.path.split('.')[0]] : [],
  );
};
