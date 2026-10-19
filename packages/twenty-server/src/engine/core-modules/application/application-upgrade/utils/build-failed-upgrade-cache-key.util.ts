export const buildFailedUpgradeCacheKey = ({
  applicationRegistrationId,
  workspaceId,
}: {
  applicationRegistrationId: string;
  workspaceId: string;
}): string =>
  `application-upgrade-failure:${applicationRegistrationId}:${workspaceId}`;
