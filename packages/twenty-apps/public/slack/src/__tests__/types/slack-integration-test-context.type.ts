import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type AppRuntimeMock } from 'src/__tests__/types/app-runtime-mock.type';
import { type SlackApiMock } from 'src/__tests__/types/slack-api-mock.type';

export type SlackIntegrationTestContext = {
  slack: SlackApiMock;
  appRuntime: AppRuntimeMock;
  coreClient: CoreApiClient;
  workspaceId: string;
};
