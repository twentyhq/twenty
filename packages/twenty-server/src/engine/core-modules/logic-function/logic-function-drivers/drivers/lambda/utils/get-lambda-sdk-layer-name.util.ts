// The metadata module ships with the server build and is app-agnostic, so its
// checksum is part of the layer identity: when the server upgrade changes it
// (e.g. a new metadata mutation), the layer name changes and every executor
// rebuilds to pick up the fresh client instead of reusing a stale layer.
export const getLambdaSdkLayerName = ({
  workspaceId,
  applicationUniversalIdentifier,
  metadataModuleChecksum,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
  metadataModuleChecksum: string;
}): string =>
  `sdk-${workspaceId}-${applicationUniversalIdentifier}-${metadataModuleChecksum.slice(0, 12)}`;
