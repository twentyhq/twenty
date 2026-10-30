import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const computeRecordExportPermissionsHash = ({
  permissionsHash,
  application,
}: {
  permissionsHash: string;
  application:
    | Pick<FlatApplication, 'id' | 'defaultRoleId' | 'deletedAt'>
    | undefined;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        permissionsHash,
        application: isDefined(application)
          ? {
              id: application.id,
              defaultRoleId: application.defaultRoleId,
              deletedAt: application.deletedAt,
            }
          : null,
      }),
    )
    .digest('hex');
