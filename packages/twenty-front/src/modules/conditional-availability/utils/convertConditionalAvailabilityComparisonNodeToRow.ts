import { CONDITIONAL_AVAILABILITY_SUBJECTS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjects';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilitySubjectRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectRowOperators';
import { getConditionalAvailabilitySubjectVariablePath } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectVariablePath';
import { getConditionalAvailabilityRowOperatorComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorComparisonOperator';
import { isString } from '@sniptt/guards';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const convertConditionalAvailabilityComparisonNodeToRow = ({
  node,
}: {
  node: ConditionalAvailabilityNode;
}): ConditionalAvailabilityRow | null => {
  if (node.type !== 'COMPARISON') {
    return null;
  }

  const { operator: comparisonOperator, left: variable, right: text } = node;

  if (
    variable.type !== 'VARIABLE' ||
    text.type !== 'LITERAL' ||
    !isString(text.value)
  ) {
    return null;
  }

  const subject = CONDITIONAL_AVAILABILITY_SUBJECTS.find(
    (candidateSubject) =>
      getConditionalAvailabilitySubjectVariablePath({
        subject: candidateSubject,
      }) === variable.path,
  );

  if (!isDefined(subject)) {
    return null;
  }

  const operator = getConditionalAvailabilitySubjectRowOperators({
    subject,
  }).find(
    (candidateOperator) =>
      getConditionalAvailabilityRowOperatorComparisonOperator({
        operator: candidateOperator,
      }) === comparisonOperator,
  );

  if (!isDefined(operator)) {
    return null;
  }

  return {
    type: 'row',
    id: v4(),
    subject,
    operator,
    values: [text.value],
  };
};
