import { kv } from 'twenty-sdk/logic-function';

import { GRANOLA_STALE_REGISTRATIONS_KEY } from 'src/constants/granola.constant';
import { type GranolaStaleRegistration } from 'src/logic-functions/types/granola-stale-registration.type';
import { type createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { deleteStaleGranolaWebhookEndpointOrThrow } from 'src/logic-functions/utils/delete-stale-granola-webhook-endpoint-or-throw.util';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const cleanupStaleGranolaRegistrationsOrThrow = async ({
  client,
  activeRegistrationId,
}: {
  client: Pick<
    ReturnType<typeof createGranolaClientOrThrow>,
    'deleteWebhookEndpoint'
  >;
  activeRegistrationId?: string;
}): Promise<void> => {
  const staleRegistrations =
    (await kv.get<GranolaStaleRegistration[]>(
      GRANOLA_STALE_REGISTRATIONS_KEY,
    )) ?? [];
  const remainingRegistrations: GranolaStaleRegistration[] = [];
  for (const registration of staleRegistrations) {
    if (registration.registrationId === activeRegistrationId) {
      remainingRegistrations.push(registration);
      continue;
    }
    await kv.delete(
      getGranolaRegistrationClaimKey(registration.registrationId),
      { scope: 'SERVER' },
    );
    try {
      await deleteStaleGranolaWebhookEndpointOrThrow({
        client,
        webhookEndpointId: registration.webhookEndpointId,
      });
    } catch (error) {
      remainingRegistrations.push(registration);
      console.error(
        `[granola] Could not remove previous endpoint ${registration.webhookEndpointId}; remove it in Granola settings. ${toErrorMessage(error)}`,
      );
    }
  }
  if (remainingRegistrations.length > 0) {
    await kv.set(GRANOLA_STALE_REGISTRATIONS_KEY, remainingRegistrations);
  } else {
    await kv.delete(GRANOLA_STALE_REGISTRATIONS_KEY);
  }
};
