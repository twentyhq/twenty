import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRowLevelPermissionRulesToSave } from '@/settings/roles/role/utils/getRowLevelPermissionRulesToSave';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const OBJECT_ID = 'company-object-id';

const buildRootGroup = (
  id: string,
  grants: Partial<RowLevelPermissionPredicateGroup> = {},
): RowLevelPermissionPredicateGroup => ({
  __typename: 'RowLevelPermissionPredicateGroup',
  id,
  parentRowLevelPermissionPredicateGroupId: null,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  roleId: 'role-id',
  objectMetadataId: OBJECT_ID,
  rowLevelPermissionRuleId: null,
  ...grants,
});

const buildPredicate = (
  id: string,
  rowLevelPermissionPredicateGroupId: string,
): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: 'field-id',
  relationFieldMetadataId: null,
  objectMetadataId: OBJECT_ID,
  operand: RowLevelPermissionPredicateOperand.IS,
  subFieldName: null,
  workspaceMemberFieldMetadataId: 'workspace-member-id-field',
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId,
  positionInRowLevelPermissionPredicateGroup: 0,
  roleId: 'role-id',
  value: null,
  rowLevelPermissionRuleId: null,
});

describe('getRowLevelPermissionRulesToSave', () => {
  it('should send each rule grants and drop rules without a filter', () => {
    const [rulesToSave] = getRowLevelPermissionRulesToSave({
      draftRole: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        rowLevelPermissionPredicateGroups: [
          buildRootGroup('owner-rule', {
            canUpdateRecords: true,
            canSoftDeleteRecords: true,
          }),
          buildRootGroup('empty-rule'),
        ],
        rowLevelPermissionPredicates: [buildPredicate('owner', 'owner-rule')],
      },
    });

    expect(rulesToSave.objectMetadataId).toBe(OBJECT_ID);
    expect(rulesToSave.predicateGroups.map(({ id }) => id)).toEqual([
      'owner-rule',
    ]);
    expect(rulesToSave.ruleGrants).toEqual([
      {
        rootPredicateGroupId: 'owner-rule',
        canCreateRecords: true,
        canReadRecords: true,
        canUpdateRecords: true,
        canSoftDeleteRecords: true,
        canDestroyRecords: false,
      },
    ]);
  });

  it('should send an empty rule set for an object whose rules were all removed', () => {
    expect(
      getRowLevelPermissionRulesToSave({
        draftRole: DEFAULT_SETTINGS_DRAFT_ROLE,
        persistedRole: {
          ...DEFAULT_SETTINGS_DRAFT_ROLE,
          rowLevelPermissionPredicateGroups: [buildRootGroup('owner-rule')],
          rowLevelPermissionPredicates: [buildPredicate('owner', 'owner-rule')],
        },
      }),
    ).toEqual([
      {
        objectMetadataId: OBJECT_ID,
        predicates: [],
        predicateGroups: [],
        ruleGrants: [],
      },
    ]);
  });
});
