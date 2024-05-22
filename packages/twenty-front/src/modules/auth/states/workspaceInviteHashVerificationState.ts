import { createState } from 'twenty-ui';

import { TokenVerificationType } from '@/auth/types/tokenVerificationType';

export const passwordResetTokenVerificationState =
  createState<TokenVerificationType>({
    key: 'passwordResetTokenVerification',
    defaultValue: TokenVerificationType.Pending,
  });
