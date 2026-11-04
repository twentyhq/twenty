import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export const APPLICATION_CONNECTION_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: false,
    apiKey: false,
    oauthClient: false,
    application: true,
  },
  requiredPermissionFlags: [],
};
