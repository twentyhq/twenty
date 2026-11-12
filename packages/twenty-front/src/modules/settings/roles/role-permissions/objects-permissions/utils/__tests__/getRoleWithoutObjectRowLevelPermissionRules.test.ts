import { DEFAULT_SETTINGS_DRAFT_ROLE } from '@/settings/roles/constants/DefaultSettingsDraftRole';
import { getRoleWithoutObjectRowLevelPermissionRules } from '@/settings/roles/role-permissions/objects-permissions/utils/getRoleWithoutObjectRowLevelPermissionRules';
import {
  type RowLevelPermissionPredicate,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from '~/generated-metadata/graphql';

const buildPredicate = ({
  id,
  objectMetadataId,
  relationFieldMetadataId = null,
}: {
  id: string;
  objectMetadataId: string;
  relationFieldMetadataId?: string | null;
}): RowLevelPermissionPredicate => ({
  __typename: 'RowLevelPermissionPredicate',
  id,
  fieldMetadataId: 'field-id',
  relationFieldMetadataId,
  objectMetadataId,
  operand: RowLevelPermissionPredicateOperand.IS,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
  roleId: 'role-id',
  value: 'value',
});

describe('getRoleWithoutObjectRowLevelPermissionRules', () => {
  it('should drop the object rules but keep its related record paths and other objects', () => {
    const role = getRoleWithoutObjectRowLevelPermissionRules({
      role: {
        ...DEFAULT_SETTINGS_DRAFT_ROLE,
        rowLevelPermissionPredicates: [
          buildPredicate({ id: 'rule', objectMetadataId: 'company' }),
          buildPredicate({
            id: 'related-path',
            objectMetadataId: 'company',
            relationFieldMetadataId: 'relation-field-id',
          }),
          buildPredicate({ id: 'other-object', objectMetadataId: 'person' }),
        ],
        rowLevelPermissionPredicateGroups: [
          {
            __typename: 'RowLevelPermissionPredicateGroup',
            id: 'company-group',
            parentRowLevelPermissionPredicateGroupId: null,
            logicalOperator:
              RowLevelPermissionPredicateGroupLogicalOperator.AND,
            positionInRowLevelPermissionPredicateGroup: null,
            canReadRecords: true,
            canUpdateRecords: false,
            canSoftDeleteRecords: false,
            canDestroyRecords: false,
            roleId: 'role-id',
            objectMetadataId: 'company',
          },
        ],
      },
      objectMetadataId: 'company',
    });

    expect(role.rowLevelPermissionPredicates?.map(({ id }) => id)).toEqual([
      'related-path',
      'other-object',
    ]);
    expect(role.rowLevelPermissionPredicateGroups).toEqual([]);
  });
});
