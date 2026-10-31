import { createHash } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { type ApplicationWithRuntimeRole, getApplicationRuntimeRoleId } from 'src/engine/core-modules/application/application-grant/utils/get-application-runtime-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const computeRecordExportPermissionsHash = ({
  permissionsHash,
  application,
}: {
  permissionsHash: string;
  application:
    | (Pick<FlatApplication, 'id' | 'deletedAt'> & ApplicationWithRuntimeRole)
    | undefined;
}): string =>
  createHash('sha256')
    .update(
      JSON.stringify({
        permissionsHash,
        application: isDefined(application)
          ? {
              id: application.id,
              runtimeRoleId: getApplicationRuntimeRoleId(application),
              deletedAt: application.deletedAt,
            }
          : null,
      }),
    )
    .digest('hex');
