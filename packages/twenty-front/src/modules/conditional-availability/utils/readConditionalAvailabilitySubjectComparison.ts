import { CONDITIONAL_AVAILABILITY_SUBJECT_PATHS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectPaths';
import { type ConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/types/ConditionalAvailabilityOfferedSubjects';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { buildConditionalAvailabilitySubjectRow } from '@/conditional-availability/utils/buildConditionalAvailabilitySubjectRow';
import { isString } from '@sniptt/guards';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const readConditionalAvailabilitySubjectComparison = ({
  node,
  offeredSubjects,
}: {
  node: ConditionalAvailabilityNode;
  offeredSubjects: ConditionalAvailabilityOfferedSubjects;
}): ConditionalAvailabilityRow | null => {
  if (
    node.type !== 'COMPARISON' ||
    (node.operator !== 'EQUAL' && node.operator !== 'NOT_EQUAL') ||
    node.left.type !== 'PATH' ||
    node.right.type !== 'LITERAL' ||
    !isString(node.right.value)
  ) {
    return null;
  }

  const { path } = node.left;
  const subject = (['role', 'workspaceMember', 'device'] as const).find(
    (candidate) => CONDITIONAL_AVAILABILITY_SUBJECT_PATHS[candidate] === path,
  );

  if (!isDefined(subject) || !offeredSubjects[subject]) {
    return null;
  }

  return buildConditionalAvailabilitySubjectRow({
    subject,
    isNegated: node.operator === 'NOT_EQUAL',
    values: [node.right.value],
  });
};
