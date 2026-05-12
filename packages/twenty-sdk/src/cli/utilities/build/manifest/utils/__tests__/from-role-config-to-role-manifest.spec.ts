import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
  type RoleConfig,
} from '@/sdk/define';
import { fromRoleConfigToRoleManifest } from '@/cli/utilities/build/manifest/utils/from-role-config-to-role-manifest';

describe('fromRoleConfigToRoleManifest', () => {
  it('generates stable manifest identifiers for row level permissions', () => {
    const roleConfig: RoleConfig = {
      universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
      label: 'Ambassador Manager',
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: 'cb8407cb-35c3-5336-becf-58995b35582b',
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.OR,
        },
      ],
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          operand: RowLevelPermissionPredicateOperand.IS,
          value: {
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          },
          rowLevelPermissionPredicateGroupUniversalIdentifier:
            'cb8407cb-35c3-5336-becf-58995b35582b',
        },
      ],
    };

    const firstManifest = fromRoleConfigToRoleManifest(roleConfig);
    const secondManifest = fromRoleConfigToRoleManifest(roleConfig);

    expect(
      firstManifest.rowLevelPermissionPredicateGroups?.[0].universalIdentifier,
    ).toBe('cb8407cb-35c3-5336-becf-58995b35582b');
    expect(
      firstManifest.rowLevelPermissionPredicates?.[0]
        .rowLevelPermissionPredicateGroupUniversalIdentifier,
    ).toBe('cb8407cb-35c3-5336-becf-58995b35582b');
    expect(
      firstManifest.rowLevelPermissionPredicates?.[0].universalIdentifier,
    ).toBe(
      secondManifest.rowLevelPermissionPredicates?.[0].universalIdentifier,
    );
  });
});
