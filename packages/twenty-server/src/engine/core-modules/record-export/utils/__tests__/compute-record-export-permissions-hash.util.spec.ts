import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeRecordExportPermissionsHash } from 'src/engine/core-modules/record-export/utils/compute-record-export-permissions-hash.util';

const application: Pick<FlatApplication, 'id' | 'defaultRoleId' | 'deletedAt'> =
  {
    id: 'application-id',
    defaultRoleId: 'role-id',
    deletedAt: null,
  };
const permissionsHash = 'workspace-permissions';
const grantRoleId = 'grant-role-id';

const originalHash = computeRecordExportPermissionsHash({
  permissionsHash,
  application,
  grantRoleId,
});

describe('computeRecordExportPermissionsHash', () => {
  it('ignores application settings unrelated to permissions', () => {
    const updatedApplication = { ...application, autoUpgrade: true };

    expect(
      computeRecordExportPermissionsHash({
        permissionsHash,
        application: updatedApplication,
        grantRoleId,
      }),
    ).toBe(originalHash);
  });

  it('changes when workspace permissions change', () => {
    expect(
      computeRecordExportPermissionsHash({
        permissionsHash: 'changed-workspace-permissions',
        application,
        grantRoleId,
      }),
    ).not.toBe(originalHash);
  });

  it.each([
    {
      name: 'identity changes',
      application: { ...application, id: 'other-id' },
      grantRoleId,
    },
    {
      name: 'default role changes',
      application: { ...application, defaultRoleId: 'other-role-id' },
      grantRoleId,
    },
    {
      name: 'default role is removed',
      application: { ...application, defaultRoleId: null },
      grantRoleId,
    },
    {
      name: 'is deleted',
      application: { ...application, deletedAt: new Date('2026-10-14') },
      grantRoleId,
    },
    {
      name: 'grant role changes',
      application,
      grantRoleId: 'other-grant-role-id',
    },
    { name: 'grant role is removed', application, grantRoleId: undefined },
  ])(
    'changes when the application $name',
    ({ application: updatedApplication, grantRoleId: updatedGrantRoleId }) => {
      expect(
        computeRecordExportPermissionsHash({
          permissionsHash,
          application: updatedApplication,
          grantRoleId: updatedGrantRoleId,
        }),
      ).not.toBe(originalHash);
    },
  );
});
