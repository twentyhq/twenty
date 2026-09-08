import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_STALE_REGISTRATIONS_KEY } from 'src/constants/granola.constant';
import { type GranolaStaleRegistration } from 'src/logic-functions/types/granola-stale-registration.type';
import { type GranolaWebhookRegistration } from 'src/logic-functions/types/granola-webhook-registration.type';

export const retireGranolaRegistrationOrThrow = async (
  registration: Pick<
    GranolaWebhookRegistration,
    'registrationId' | 'webhookEndpointId'
  >,
): Promise<void> => {
  const staleRegistrations =
    (await kv.get<GranolaStaleRegistration[]>(
      GRANOLA_STALE_REGISTRATIONS_KEY,
    )) ?? [];

  if (
    staleRegistrations.some(
      ({ registrationId }) => registrationId === registration.registrationId,
    )
  ) {
    return;
  }

  await kv.set(GRANOLA_STALE_REGISTRATIONS_KEY, [
    ...staleRegistrations,
    {
      registrationId: registration.registrationId,
      webhookEndpointId: registration.webhookEndpointId,
    },
  ]);
};
