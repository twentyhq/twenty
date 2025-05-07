import { z } from 'zod';

import { registerEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

export const USER_SIGNUP_EVENT = 'User Signup' as const;
export const userSignupSchema = z
  .object({
    event: z.literal(USER_SIGNUP_EVENT),
    properties: z.object({}).strict(),
  })
  .strict();

export type UserSignupTrackEvent = z.infer<typeof userSignupSchema>;

registerEvent(USER_SIGNUP_EVENT, userSignupSchema);
