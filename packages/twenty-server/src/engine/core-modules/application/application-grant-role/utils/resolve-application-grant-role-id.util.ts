import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

const logger = new Logger('ResolveApplicationGrantRoleId');

// The role an application runs with: its grant, see twentyhq/core-team-issues#3146
export const resolveApplicationGrantRoleId = ({
  flatApplication,
  workspaceId,
  workspaceCustomApplicationId,
  flatRoleTargetByApplicationIdMaps,
}: {
  flatApplication: Pick<FlatApplication, 'id' | 'defaultRoleId' | 'sourceType'>;
  workspaceId: string;
  workspaceCustomApplicationId: string;
  flatRoleTargetByApplicationIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
}): string | undefined => {
  if (
    isOAuthOnlyApplication(flatApplication) ||
    !isDefined(flatApplication.defaultRoleId)
  ) {
    return undefined;
  }

  if (flatApplication.id === workspaceCustomApplicationId) {
    return flatApplication.defaultRoleId;
  }

  const grantRoleId =
    flatRoleTargetByApplicationIdMaps[flatApplication.id]?.roleId;

  if (isDefined(grantRoleId)) {
    return grantRoleId;
  }

  // TODO: remove this fallback once every application is known to have its grant,
  // and with it the role comparisons in getPermissionsPrincipalsActingApplication
  logger.warn(
    `Application ${flatApplication.id} has no grant role in workspace ${workspaceId}, it runs with its requested role`,
  );

  return flatApplication.defaultRoleId;
};
