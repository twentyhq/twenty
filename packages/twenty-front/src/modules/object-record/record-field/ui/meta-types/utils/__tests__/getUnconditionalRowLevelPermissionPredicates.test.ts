/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { getUnconditionalRowLevelPermissionPredicates } from '@/object-record/record-field/ui/meta-types/utils/getUnconditionalRowLevelPermissionPredicates';

const createPredicate = ({
  id,
  rowLevelPermissionPredicateGroupId = null,
}: {
  id: string;
  rowLevelPermissionPredicateGroupId?: string | null;
}): RowLevelPermissionPredicate => ({
  id,
  fieldMetadataId: 'field-metadata-id',
  objectMetadataId: 'object-metadata-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: 'ACTIVE',
  subFieldName: null,
  rowLevelPermissionPredicateGroupId,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  roleId: 'role-id',
});

const createGroup = ({
  id,
  logicalOperator,
  parentRowLevelPermissionPredicateGroupId = null,
}: {
  id: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  parentRowLevelPermissionPredicateGroupId?: string | null;
}): RowLevelPermissionPredicateGroup => ({
  id,
  logicalOperator,
  objectMetadataId: 'object-metadata-id',
  parentRowLevelPermissionPredicateGroupId,
  positionInRowLevelPermissionPredicateGroup: 0,
  roleId: 'role-id',
});

describe('getUnconditionalRowLevelPermissionPredicates', () => {
  it('keeps predicates that belong to no group', () => {
    const predicate = createPredicate({ id: 'predicate-id' });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [],
      }),
    ).toEqual([predicate]);
  });

  it('drops predicates that belong to an OR group', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'or-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'or-group-id',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('keeps predicates that belong to an AND group', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'and-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'and-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          }),
        ],
      }),
    ).toEqual([predicate]);
  });

  it('drops predicates in an AND group nested under an OR group', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'nested-and-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'nested-and-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'or-group-id',
          }),
          createGroup({
            id: 'or-group-id',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('keeps predicates in an AND group nested under another AND group', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'nested-and-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'nested-and-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'parent-and-group-id',
          }),
          createGroup({
            id: 'parent-and-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          }),
        ],
      }),
    ).toEqual([predicate]);
  });

  it('drops predicates whose group is missing from the group list', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'unknown-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [],
      }),
    ).toEqual([]);
  });

  it('terminates on a group that is its own parent', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'self-parented-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'self-parented-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'self-parented-group-id',
          }),
        ],
      }),
    ).toEqual([predicate]);
  });

  it('terminates on a two-group parent cycle', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'first-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'first-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'second-group-id',
          }),
          createGroup({
            id: 'second-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'first-group-id',
          }),
        ],
      }),
    ).toEqual([predicate]);
  });

  it('finds an OR ancestor before a cycle closes', () => {
    const predicate = createPredicate({
      id: 'predicate-id',
      rowLevelPermissionPredicateGroupId: 'and-group-id',
    });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicate],
        predicateGroups: [
          createGroup({
            id: 'and-group-id',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'or-group-id',
          }),
          createGroup({
            id: 'or-group-id',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
            parentRowLevelPermissionPredicateGroupId: 'and-group-id',
          }),
        ],
      }),
    ).toEqual([]);
  });

  it('keeps only the predicates outside OR groups in a mixed rule', () => {
    const predicateInOrGroup = createPredicate({
      id: 'predicate-in-or-group',
      rowLevelPermissionPredicateGroupId: 'or-group-id',
    });
    const ungroupedPredicate = createPredicate({ id: 'ungrouped-predicate' });

    expect(
      getUnconditionalRowLevelPermissionPredicates({
        predicates: [predicateInOrGroup, ungroupedPredicate],
        predicateGroups: [
          createGroup({
            id: 'or-group-id',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual([ungroupedPredicate]);
  });
});
