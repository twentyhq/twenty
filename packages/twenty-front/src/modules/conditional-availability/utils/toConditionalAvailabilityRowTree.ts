import { CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilityNegatedOperators';
import { type ConditionalAvailabilityOfferedSubjects } from '@/conditional-availability/types/ConditionalAvailabilityOfferedSubjects';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';
import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { buildConditionalAvailabilitySubjectRow } from '@/conditional-availability/utils/buildConditionalAvailabilitySubjectRow';
import { readConditionalAvailabilityRecordFilter } from '@/conditional-availability/utils/readConditionalAvailabilityRecordFilter';
import { readConditionalAvailabilitySubjectComparison } from '@/conditional-availability/utils/readConditionalAvailabilitySubjectComparison';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type ConditionalAvailabilityLogicalOperator,
  type ConditionalAvailabilityNode,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const MAX_GROUP_DEPTH = 2;

const mergeRows = ({
  previousRow,
  row,
  logicalOperator,
}: {
  previousRow: ConditionalAvailabilityRow;
  row: ConditionalAvailabilityRow;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityRow | null => {
  if (
    previousRow.subject !== row.subject ||
    (row.subject !== 'role' && row.subject !== 'workspaceMember')
  ) {
    return null;
  }

  const isNegated = CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS.includes(
    row.operator,
  );
  const mergingLogicalOperator = isNegated
    ? doNotTranslate('AND')
    : doNotTranslate('OR');

  if (
    CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS.includes(
      previousRow.operator,
    ) !== isNegated ||
    mergingLogicalOperator !== logicalOperator
  ) {
    return null;
  }

  return buildConditionalAvailabilitySubjectRow({
    subject: row.subject,
    isNegated,
    values: [...previousRow.values, ...row.values],
  });
};

const toGroupChild = ({
  rows,
  logicalOperator,
  canBeGroup,
}: {
  rows: ConditionalAvailabilityRow[];
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  canBeGroup: boolean;
}): ConditionalAvailabilityRowTreeChild | null => {
  const [firstRow] = rows;

  if (!isDefined(firstRow)) {
    return null;
  }

  if (rows.length === 1) {
    return { type: 'row', row: firstRow };
  }

  return canBeGroup
    ? { type: 'group', group: { id: v4(), logicalOperator, rows } }
    : null;
};

export const toConditionalAvailabilityRowTree = ({
  node,
  offeredSubjects,
  fields,
}: {
  node: ConditionalAvailabilityNode;
  offeredSubjects: ConditionalAvailabilityOfferedSubjects;
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityRowTree | null => {
  const readChildren = ({
    nodes,
    logicalOperator,
    depth,
  }: {
    nodes: ConditionalAvailabilityNode[];
    logicalOperator: ConditionalAvailabilityLogicalOperator;
    depth: number;
  }): ConditionalAvailabilityRowTreeChild[] | null => {
    const readChild = (
      childNode: ConditionalAvailabilityNode,
    ): ConditionalAvailabilityRowTreeChild | null => {
      if (childNode.type !== 'GROUP') {
        const row =
          readConditionalAvailabilitySubjectComparison({
            node: childNode,
            offeredSubjects,
          }) ??
          readConditionalAvailabilityRecordFilter({
            node: childNode,
            offeredSubjects,
            fields,
          });

        return isDefined(row) ? { type: 'row', row } : null;
      }

      const groupChildren =
        depth < MAX_GROUP_DEPTH
          ? readChildren({
              nodes: childNode.children,
              logicalOperator: childNode.logicalOperator,
              depth: depth + 1,
            })
          : null;

      return isDefined(groupChildren)
        ? toGroupChild({
            rows: groupChildren.flatMap((groupChild) =>
              groupChild.type === 'row' ? [groupChild.row] : [],
            ),
            logicalOperator: childNode.logicalOperator,
            canBeGroup: depth === 0,
          })
        : null;
    };

    return nodes.reduce<ConditionalAvailabilityRowTreeChild[] | null>(
      (children, childNode) => {
        const child = isDefined(children) ? readChild(childNode) : null;

        if (!isDefined(children) || !isDefined(child)) {
          return null;
        }

        const previousChild = children.at(-1);
        const mergedRow =
          previousChild?.type === 'row' && child.type === 'row'
            ? mergeRows({
                previousRow: previousChild.row,
                row: child.row,
                logicalOperator,
              })
            : null;

        return isDefined(mergedRow)
          ? [...children.slice(0, -1), { type: 'row', row: mergedRow }]
          : [...children, child];
      },
      [],
    );
  };

  const defaultLogicalOperator: ConditionalAvailabilityLogicalOperator =
    doNotTranslate('AND');
  const logicalOperator =
    node.type === 'GROUP' ? node.logicalOperator : defaultLogicalOperator;

  const children = readChildren({
    nodes: node.type === 'GROUP' ? node.children : [node],
    logicalOperator,
    depth: 0,
  });

  if (!isDefined(children) || !isNonEmptyArray(children)) {
    return null;
  }

  return {
    logicalOperator:
      children.length === 1 ? defaultLogicalOperator : logicalOperator,
    children,
  };
};
