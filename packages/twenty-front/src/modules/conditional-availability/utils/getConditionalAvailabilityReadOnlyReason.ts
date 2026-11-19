import { type ConditionalAvailabilityReadOnlyReason } from '@/conditional-availability/types/ConditionalAvailabilityReadOnlyReason';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import {
  isDefined,
  listConditionalAvailabilityNodes,
} from 'twenty-shared/utils';

const getVariableRoots = ({
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

export const getConditionalAvailabilityReadOnlyReason = ({
  node,
  hasRolesPermission,
}: {
  node: ConditionalAvailabilityNode | null;
  hasRolesPermission: boolean;
}): ConditionalAvailabilityReadOnlyReason | null => {
  const variableRoots = getVariableRoots({ node });

  if (variableRoots.includes('featureFlags')) {
    return 'featureFlags';
  }

  if (!hasRolesPermission && variableRoots.includes('currentRole')) {
    return 'roles';
  }

  return null;
};
