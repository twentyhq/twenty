export const getLambdaSdkLayerName = ({
  workspaceId,
  applicationUniversalIdentifier,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
}): string => `sdk-${workspaceId}-${applicationUniversalIdentifier}`;
