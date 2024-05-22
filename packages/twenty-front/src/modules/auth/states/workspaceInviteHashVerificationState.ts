import { createState } from 'twenty-ui';

import { TokenVerificationType } from '@/auth/types/tokenVerificationType';

export const workspaceInviteHashVerificationState =
  createState<TokenVerificationType>({
    key: 'workspaceInviteHashVerificationState',
    defaultValue: TokenVerificationType.Pending,
  });
