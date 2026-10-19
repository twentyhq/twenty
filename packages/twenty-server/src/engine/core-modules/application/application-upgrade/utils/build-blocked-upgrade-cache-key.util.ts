export const buildBlockedUpgradeCacheKey = ({
  applicationRegistrationId,
  workspaceId,
}: {
  applicationRegistrationId: string;
  workspaceId: string;
}): string =>
  `application-upgrade-blocked:${applicationRegistrationId}:${workspaceId}`;
