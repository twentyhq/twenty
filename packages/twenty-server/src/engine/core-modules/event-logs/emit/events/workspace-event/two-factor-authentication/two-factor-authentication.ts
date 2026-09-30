import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/track';

export const TWO_FACTOR_AUTHENTICATION_EVENT =
  'TwoFactorAuthentication' as const;

export const twoFactorAuthenticationSchema = z.strictObject({
  event: z.literal(TWO_FACTOR_AUTHENTICATION_EVENT),
  properties: z.strictObject({
    action: z.enum([
      'method_provisioned',
      'method_verified',
      'method_deleted',
      'otp_rejected',
      'recovery_code_issued',
      'recovery_code_revoked',
    ]),
    strategy: z.string().optional(),
    targetUserId: z.string().optional(),
    message: z.string().optional(),
  }),
});

export type TwoFactorAuthenticationTrackEvent = z.infer<
  typeof twoFactorAuthenticationSchema
>;

registerEvent(TWO_FACTOR_AUTHENTICATION_EVENT, twoFactorAuthenticationSchema);
