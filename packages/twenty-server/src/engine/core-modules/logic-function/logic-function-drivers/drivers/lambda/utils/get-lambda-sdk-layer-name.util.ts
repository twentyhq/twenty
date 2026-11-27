import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';

export const getLambdaSdkLayerName = ({
  workspaceId,
  applicationUniversalIdentifier,
}: {
  workspaceId: string;
  applicationUniversalIdentifier: string;
}): string =>
  `sdk-${SDK_CLIENT_GENERATION_KEY}-${workspaceId}-${applicationUniversalIdentifier}`;
