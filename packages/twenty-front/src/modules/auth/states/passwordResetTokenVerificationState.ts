import { createState } from 'twenty-ui';

import { TokenVerificationType } from '@/auth/types/tokenVerificationType';

export const passwordResetTokenVerificationState =
  createState<TokenVerificationType>({
    key: 'passwordResetTokenVerificationState',
    defaultValue: TokenVerificationType.Pending,
  });
