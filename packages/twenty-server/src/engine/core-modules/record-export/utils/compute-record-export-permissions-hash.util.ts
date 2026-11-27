import { createHash } from 'crypto';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const computeRecordExportPermissionsHash = ({
  permissionsHash,
  application,
  grantRoleId,
}: {
  permissionsHash: string;
  application: Pick<FlatApplication, 'id' | 'requestedRoleId' | 'deletedAt'>;
  grantRoleId: string | undefined;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        permissionsHash,
        application: {
          id: application.id,
          // Key kept so hashes of exports started before the rename still match
          defaultRoleId: application.requestedRoleId,
          deletedAt: application.deletedAt,
          grantRoleId: grantRoleId ?? null,
        },
      }),
    )
    .digest('hex');
