/* @license Enterprise */

import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from 'twenty-shared/types';

import { isSelectValueAllowedByRowLevelPermissionPredicates } from '@/object-record/record-field/ui/meta-types/utils/isSelectValueAllowedByRowLevelPermissionPredicates';

const STAGE_FIELD_METADATA_ID = 'stage-field-metadata-id';
const OWNER_FIELD_METADATA_ID = 'owner-field-metadata-id';

const createPredicate = ({
  id,
  fieldMetadataId = STAGE_FIELD_METADATA_ID,
  operand,
  value = null,
  rowLevelPermissionPredicateGroupId = null,
}: {
  id: string;
  fieldMetadataId?: string;
  operand: RowLevelPermissionPredicateOperand;
  value?: RowLevelPermissionPredicateValue;
  rowLevelPermissionPredicateGroupId?: string | null;
}): RowLevelPermissionPredicate => ({
  id,
  fieldMetadataId,
  objectMetadataId: 'object-metadata-id',
  operand,
  value,
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

const ownerIsMe = ({ groupId }: { groupId: string | null }) =>
  createPredicate({
    id: 'owner-is-me',
    fieldMetadataId: OWNER_FIELD_METADATA_ID,
    operand: RowLevelPermissionPredicateOperand.IS,
    value: 'current-workspace-member-id',
    rowLevelPermissionPredicateGroupId: groupId,
  });

const evaluate = ({
  predicates,
  predicateGroups = [],
}: {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups?: RowLevelPermissionPredicateGroup[];
}) => {
  const isAllowed = (selectValue: string | null) =>
    isSelectValueAllowedByRowLevelPermissionPredicates({
      fieldMetadataId: STAGE_FIELD_METADATA_ID,
      selectValue,
      predicates,
      predicateGroups,
    });

  return {
    allowedOptions: ['MEETING', 'PROPOSAL', 'WON'].filter(isAllowed),
    canSelectEmpty: isAllowed(null),
  };
};

describe('isSelectValueAllowedByRowLevelPermissionPredicates', () => {
  it('restricts options with an ungrouped predicate', () => {
    expect(
      evaluate({
        predicates: [
          createPredicate({
            id: 'stage-is-not-meeting',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            value: ['MEETING'],
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['PROPOSAL', 'WON'], canSelectEmpty: false });
  });

  it('restricts options with a predicate in an AND group', () => {
    expect(
      evaluate({
        predicates: [
          ownerIsMe({ groupId: 'root-group' }),
          createPredicate({
            id: 'stage-is-meeting-or-won',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: '["MEETING","WON"]',
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['MEETING', 'WON'], canSelectEmpty: false });
  });

  it('keeps an option excluded by one branch of an OR group', () => {
    expect(
      evaluate({
        predicates: [
          ownerIsMe({ groupId: 'root-group' }),
          createPredicate({
            id: 'stage-is-not-meeting',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
          createPredicate({
            id: 'owner-is-empty',
            fieldMetadataId: OWNER_FIELD_METADATA_ID,
            operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual({
      allowedOptions: ['MEETING', 'PROPOSAL', 'WON'],
      canSelectEmpty: true,
    });
  });

  it('offers the union of the values allowed by an OR group on the field', () => {
    expect(
      evaluate({
        predicates: [
          createPredicate({
            id: 'stage-is-meeting',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
          createPredicate({
            id: 'stage-is-won',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['WON'],
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['MEETING', 'WON'], canSelectEmpty: false });
  });

  it('applies an OR group nested under an AND group', () => {
    expect(
      evaluate({
        predicates: [
          ownerIsMe({ groupId: 'root-group' }),
          createPredicate({
            id: 'stage-is-meeting',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'nested-group',
          }),
          createPredicate({
            id: 'stage-is-won',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['WON'],
            rowLevelPermissionPredicateGroupId: 'nested-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
          }),
          createGroup({
            id: 'nested-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
            parentRowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['MEETING', 'WON'], canSelectEmpty: false });
  });

  it('applies an AND group nested under an OR group', () => {
    expect(
      evaluate({
        predicates: [
          ownerIsMe({ groupId: 'nested-group' }),
          createPredicate({
            id: 'stage-is-meeting',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'nested-group',
          }),
          createPredicate({
            id: 'stage-is-won',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['WON'],
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
          createGroup({
            id: 'nested-group',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['MEETING', 'WON'], canSelectEmpty: false });
  });

  it('combines the root groups of several roles with AND', () => {
    expect(
      evaluate({
        predicates: [
          createPredicate({
            id: 'first-role-stage-is-not-meeting',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'first-role-root-group',
          }),
          createPredicate({
            id: 'second-role-stage-is-not-won',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            value: ['WON'],
            rowLevelPermissionPredicateGroupId: 'second-role-root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'first-role-root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
          createGroup({
            id: 'second-role-root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['PROPOSAL'], canSelectEmpty: false });
  });

  it('allows clearing the field when an OR branch accepts an empty value', () => {
    expect(
      evaluate({
        predicates: [
          createPredicate({
            id: 'stage-is-empty',
            operand: RowLevelPermissionPredicateOperand.IS_EMPTY,
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
          createPredicate({
            id: 'stage-is-won',
            operand: RowLevelPermissionPredicateOperand.IS,
            value: ['WON'],
            rowLevelPermissionPredicateGroupId: 'root-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'root-group',
            logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
          }),
        ],
      }),
    ).toEqual({ allowedOptions: ['WON'], canSelectEmpty: true });
  });

  it('ignores a predicate whose group is not reachable from a root group', () => {
    expect(
      evaluate({
        predicates: [
          createPredicate({
            id: 'stage-is-not-meeting',
            operand: RowLevelPermissionPredicateOperand.IS_NOT,
            value: ['MEETING'],
            rowLevelPermissionPredicateGroupId: 'orphan-group',
          }),
        ],
        predicateGroups: [
          createGroup({
            id: 'orphan-group',
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            parentRowLevelPermissionPredicateGroupId: 'missing-group',
          }),
        ],
      }),
    ).toEqual({
      allowedOptions: ['MEETING', 'PROPOSAL', 'WON'],
      canSelectEmpty: true,
    });
  });
});
