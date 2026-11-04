import { PermissionFlagType } from 'twenty-shared/constants';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export const API_KEY_ROLE_WRITE_ACCESS_POLICY: AccessPolicy = {
  authPrincipals: {
    userSession: {
      standard: true,
      impersonated: true,
      playground: false,
      workspaceAgnostic: false,
    },
    apiKey: false,
    oauthClient: false,
    application: false,
  },
  requiredPermissionFlags: [
    PermissionFlagType.API_KEYS_AND_WEBHOOKS,
    PermissionFlagType.ROLES,
  ],
};
