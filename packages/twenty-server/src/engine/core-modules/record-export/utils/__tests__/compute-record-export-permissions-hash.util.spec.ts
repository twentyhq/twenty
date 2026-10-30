import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { computeRecordExportPermissionsHash } from 'src/engine/core-modules/record-export/utils/compute-record-export-permissions-hash.util';

const application: Pick<FlatApplication, 'id' | 'defaultRoleId' | 'deletedAt'> =
  {
    id: 'application-id',
    defaultRoleId: 'role-id',
    deletedAt: null,
  };
const permissionsHash = 'workspace-permissions';

const originalHash = computeRecordExportPermissionsHash({
  permissionsHash,
  application,
});

describe('computeRecordExportPermissionsHash', () => {
  it('ignores application settings unrelated to permissions', () => {
    const updatedApplication = { ...application, autoUpgrade: true };

    expect(
      computeRecordExportPermissionsHash({
        permissionsHash,
        application: updatedApplication,
      }),
    ).toBe(originalHash);
  });

  it('changes when workspace permissions change', () => {
    expect(
      computeRecordExportPermissionsHash({
        permissionsHash: 'changed-workspace-permissions',
        application,
      }),
    ).not.toBe(originalHash);
  });

  it.each([
    {
      name: 'identity changes',
      application: { ...application, id: 'other-id' },
    },
    {
      name: 'default role changes',
      application: { ...application, defaultRoleId: 'other-role-id' },
    },
    {
      name: 'default role is removed',
      application: { ...application, defaultRoleId: null },
    },
    {
      name: 'is deleted',
      application: { ...application, deletedAt: new Date('2026-10-14') },
    },
    { name: 'is missing', application: undefined },
  ])(
    'changes when the application $name',
    ({ application: updatedApplication }) => {
      expect(
        computeRecordExportPermissionsHash({
          permissionsHash,
          application: updatedApplication,
        }),
      ).not.toBe(originalHash);
    },
  );
});
