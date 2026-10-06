import { canRolesAccessAllRecords } from 'src/engine/core-modules/record-share/utils/can-roles-access-all-records.util';

describe('canRolesAccessAllRecords', () => {
  const roleIdsWithAllRecordsAccess = ['admin', 'auditor'];

  it.each([
    [['admin'], true],
    [['admin', 'auditor'], true],
    [['admin', 'member'], false],
    [['member'], false],
    [[], false],
  ])('decides access for roles %j', (roleIds, expected) => {
    expect(
      canRolesAccessAllRecords({ roleIds, roleIdsWithAllRecordsAccess }),
    ).toBe(expected);
  });
});
