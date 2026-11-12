import { getRowLevelPermissionRuleLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getRowLevelPermissionRuleLabel';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const OBJECT_METADATA_ITEM = {
  fields: [{ id: 'deleted-at-field', label: 'Deleted at' }],
} as Parameters<typeof getRowLevelPermissionRuleLabel>[0]['objectMetadataItem'];

const buildPredicate = (
  overrides: Partial<RowLevelPermissionPredicate>,
): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id: 'predicate-id',
  fieldMetadataId: 'deleted-at-field',
  objectMetadataId: 'object-id',
  roleId: 'role-id',
  operand: RowLevelPermissionPredicateOperand.IS,
  value: '2026-11-12',
  ...overrides,
});

describe('getRowLevelPermissionRuleLabel', () => {
  it('should label a rule with its field, operand and value', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [buildPredicate({})],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is 2026-11-12');
  });

  it('should spell out a relative date instead of its stored value', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [
          buildPredicate({
            operand: RowLevelPermissionPredicateOperand.IS_RELATIVE,
            value: 'NEXT_1_DAY;;Europe/Paris;;MONDAY;;',
          }),
        ],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is relative next 1 day');
  });

  it('should count the other conditions of the rule', () => {
    expect(
      getRowLevelPermissionRuleLabel({
        predicates: [buildPredicate({}), buildPredicate({ id: 'other' })],
        objectMetadataItem: OBJECT_METADATA_ITEM,
      }),
    ).toBe('Deleted at is 2026-11-12 +1');
  });
});
