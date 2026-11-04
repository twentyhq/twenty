export const buildInstallationFilterParams = (
  installations: { applicationId: string; workspaceId: string }[],
) => ({
  workspaceIds: [
    ...new Set(installations.map(({ workspaceId }) => workspaceId)),
  ],
  applicationIds: installations.map(({ applicationId }) => applicationId),
});
