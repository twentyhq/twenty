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

const readChild = ({
  node,
  offeredSubjects,
  fields,
  depth,
}: {
  node: ConditionalAvailabilityNode;
  offeredSubjects: ConditionalAvailabilityOfferedSubjects;
  fields: FieldMetadataItem[];
  depth: number;
}): ConditionalAvailabilityRowTreeChild | null => {
  if (node.type !== 'GROUP') {
    const row =
      readConditionalAvailabilitySubjectComparison({
        node,
        offeredSubjects,
      }) ??
      readConditionalAvailabilityRecordFilter({
        node,
        offeredSubjects,
        fields,
      });

    return isDefined(row) ? { type: 'row', row } : null;
  }

  if (depth >= MAX_GROUP_DEPTH) {
    return null;
  }

  const groupChildren = readChildren({
    nodes: node.children,
    logicalOperator: node.logicalOperator,
    offeredSubjects,
    fields,
    depth: depth + 1,
  });

  if (!isDefined(groupChildren)) {
    return null;
  }

  return toGroupChild({
    rows: groupChildren.flatMap((groupChild) =>
      groupChild.type === 'row' ? [groupChild.row] : [],
    ),
    logicalOperator: node.logicalOperator,
    canBeGroup: depth === 0,
  });
};

const readChildren = ({
  nodes,
  logicalOperator,
  offeredSubjects,
  fields,
  depth,
}: {
  nodes: ConditionalAvailabilityNode[];
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  offeredSubjects: ConditionalAvailabilityOfferedSubjects;
  fields: FieldMetadataItem[];
  depth: number;
}): ConditionalAvailabilityRowTreeChild[] | null => {
  const children: ConditionalAvailabilityRowTreeChild[] = [];

  for (const node of nodes) {
    const child = readChild({ node, offeredSubjects, fields, depth });

    if (!isDefined(child)) {
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

    if (isDefined(mergedRow)) {
      children[children.length - 1] = { type: 'row', row: mergedRow };
    } else {
      children.push(child);
    }
  }

  return children;
};

export const readConditionalAvailabilityRowTree = ({
  node,
  offeredSubjects,
  fields,
}: {
  node: ConditionalAvailabilityNode;
  offeredSubjects: ConditionalAvailabilityOfferedSubjects;
  fields: FieldMetadataItem[];
}): ConditionalAvailabilityRowTree | null => {
  const defaultLogicalOperator: ConditionalAvailabilityLogicalOperator =
    doNotTranslate('AND');
  const logicalOperator =
    node.type === 'GROUP' ? node.logicalOperator : defaultLogicalOperator;

  const children = readChildren({
    nodes: node.type === 'GROUP' ? node.children : [node],
    logicalOperator,
    offeredSubjects,
    fields,
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
