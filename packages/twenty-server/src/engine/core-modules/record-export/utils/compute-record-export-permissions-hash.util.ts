import { createHash } from 'crypto';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const computeRecordExportPermissionsHash = ({
  permissionsHash,
  application,
  grantRoleId,
}: {
  permissionsHash: string;
  application: Pick<FlatApplication, 'id' | 'defaultRoleId' | 'deletedAt'>;
  grantRoleId: string | undefined;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        permissionsHash,
        application: {
          id: application.id,
          defaultRoleId: application.defaultRoleId,
          deletedAt: application.deletedAt,
          grantRoleId: grantRoleId ?? null,
        },
      }),
    )
    .digest('hex');
