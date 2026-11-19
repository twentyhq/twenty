import { type AppConnection } from 'twenty-sdk/logic-function';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';

export const OWN_CONNECTION: AppConnection = {
  id: '486c773a-3e7e-4aa8-9b39-6fef855f94a4',
  providerName: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
  name: 'My Granola',
  handle: 'member@example.com',
  externalAccountId: null,
  scope: 'USER',
  visibility: 'user',
  userWorkspaceId: 'member',
  workspaceMemberId: 'workspace-member',
  providerType: 'api-key',
  accessToken: 'grn_personal_test',
  scopes: [],
  authFailedAt: null,
  authFailedReason: null,
};
export const OTHER_CONNECTION: AppConnection = {
  ...OWN_CONNECTION,
  id: 'f41ff81d-4baa-41ff-ae3c-34e5cbc2ff51',
  userWorkspaceId: 'other-member',
};
