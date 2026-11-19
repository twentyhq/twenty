import { CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilityNegatedOperators';
import { CONDITIONAL_AVAILABILITY_SUBJECT_PATHS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectPaths';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const joinNodes = ({
  nodes,
  logicalOperator,
}: {
  nodes: ConditionalAvailabilityNode[];
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityNode => {
  const [onlyNode] = nodes;

  if (nodes.length === 1 && isDefined(onlyNode)) {
    return onlyNode;
  }

  return {
    type: 'GROUP',
    logicalOperator,
    children: nodes.flatMap((node) =>
      node.type === 'GROUP' && node.logicalOperator === logicalOperator
        ? node.children
        : [node],
    ),
  };
};

const buildRowNode = (
  row: ConditionalAvailabilityRow,
): ConditionalAvailabilityNode => {
  const isNegated = CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS.includes(
    row.operator,
  );
  const path = CONDITIONAL_AVAILABILITY_SUBJECT_PATHS[row.subject];

  return joinNodes({
    nodes: row.values.map((value) => ({
      type: 'COMPARISON',
      operator: isNegated ? 'NOT_EQUAL' : 'EQUAL',
      left: { type: 'PATH', path },
      right: { type: 'LITERAL', value },
    })),
    logicalOperator: isNegated ? doNotTranslate('AND') : doNotTranslate('OR'),
  });
};

export const buildConditionalAvailabilityNode = ({
  tree,
}: {
  tree: ConditionalAvailabilityRowTree;
}): ConditionalAvailabilityNode =>
  joinNodes({
    nodes: tree.children.map((child) =>
      child.type === 'row'
        ? buildRowNode(child.row)
        : joinNodes({
            nodes: child.group.rows.map(buildRowNode),
            logicalOperator: child.group.logicalOperator,
          }),
    ),
    logicalOperator: tree.logicalOperator,
  });
