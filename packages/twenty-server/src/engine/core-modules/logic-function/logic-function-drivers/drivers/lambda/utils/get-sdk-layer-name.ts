export const getSdkLayerName = ({
  workspaceId,
  applicationUniversalIdentifier,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
}): string => `sdk-${workspaceId}-${applicationUniversalIdentifier}`;
