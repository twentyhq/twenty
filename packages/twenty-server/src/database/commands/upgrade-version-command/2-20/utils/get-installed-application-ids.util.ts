// Installed applications are every application in the workspace that is neither
// the twenty-standard application nor the workspace-custom application. Standard
// and workspace-custom objects already have a populated, indexed searchVector,
// so only installed-app objects need their search surface created and rebuilt.
export const getInstalledApplicationIds = ({
  applicationIds,
  twentyStandardApplicationId,
  workspaceCustomApplicationId,
}: {
  applicationIds: string[];
  twentyStandardApplicationId: string;
  workspaceCustomApplicationId: string;
}): Set<string> =>
  new Set(
    applicationIds.filter(
      (applicationId) =>
        applicationId !== twentyStandardApplicationId &&
        applicationId !== workspaceCustomApplicationId,
    ),
  );
