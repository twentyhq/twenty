import { CoreApiClient } from 'twenty-client-sdk/core';
import { SYNC_SIGNATURE_HEADER, signPayload } from 'src/utils/hmac';

export type PushOpportunityInput = {
  opportunityId: string;
};

export type PushOpportunityOutput = {
  ok: boolean;
  syncEventId?: string;
  reason?: string;
};

export async function pushOpportunity(
  input: PushOpportunityInput,
): Promise<PushOpportunityOutput> {
  const secret = process.env.SYNC_SHARED_SECRET;
  const endpoint = process.env.PARTNERS_SYNC_ENDPOINT;

  if (!secret || !endpoint) {
    return {
      ok: false,
      reason: 'server_misconfigured: SYNC_SHARED_SECRET or PARTNERS_SYNC_ENDPOINT not set',
    };
  }

  const client = new CoreApiClient();

  const oppResult = await client.query({
    opportunities: {
      __args: { filter: { id: { eq: input.opportunityId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          matchStatus: true,
          numberOfSeats: true,
          useCase: true,
          hostingType: true,
          subscriptionType: true,
          subscriptionFrequency: true,
          lostReason: true,
          amount: { amountMicros: true, currencyCode: true },
          closeDate: true,
          company: { name: true },
          pointOfContact: {
            name: { firstName: true, lastName: true },
            emails: { primaryEmail: true },
          },
        },
      },
    },
  } as any);

  const opp = (oppResult as any).opportunities?.edges?.[0]?.node;
  if (!opp) {
    return { ok: false, reason: `opportunity ${input.opportunityId} not found` };
  }

  // On TFT the opportunity's own id IS the cross-workspace key — there is no separate
  // tftOpportunityId field here (that lives on the partners side), so don't query it.
  const tftOpportunityId: string = opp.id as string;

  // Point of contact: forward the Person's name + primary email so the partners
  // side can find-or-create and link the same contact.
  const poc = opp.pointOfContact as
    | { name?: { firstName?: string; lastName?: string }; emails?: { primaryEmail?: string } }
    | null
    | undefined;
  const pocFirstName = poc?.name?.firstName ?? undefined;
  const pocLastName = poc?.name?.lastName ?? undefined;
  const pocEmail = poc?.emails?.primaryEmail || undefined;
  const pointOfContact =
    pocFirstName || pocLastName || pocEmail
      ? {
          ...(pocFirstName && { firstName: pocFirstName }),
          ...(pocLastName && { lastName: pocLastName }),
          ...(pocEmail && { email: pocEmail }),
        }
      : undefined;

  // Null fields must be converted to undefined so Zod's .optional() accepts them on the partners side
  const payload = {
    tftOpportunityId,
    name: opp.name as string,
    ...(opp.matchStatus != null && { matchStatus: opp.matchStatus as string }),
    ...(opp.numberOfSeats != null && { numberOfSeats: opp.numberOfSeats as number }),
    ...(opp.useCase != null && { useCase: opp.useCase as string }),
    ...(opp.hostingType != null && { hostingType: opp.hostingType as string }),
    ...(opp.subscriptionType != null && { subscriptionType: opp.subscriptionType as string }),
    ...(opp.subscriptionFrequency != null && { subscriptionFrequency: opp.subscriptionFrequency as string }),
    ...(opp.lostReason != null && { lostReason: opp.lostReason as string }),
    ...(opp.amount != null && { amount: opp.amount as { amountMicros: number; currencyCode: string } }),
    ...(opp.closeDate != null && { closeDate: opp.closeDate as string }),
    ...(opp.company?.name != null && { companyName: opp.company.name as string }),
    ...(pointOfContact && { pointOfContact }),
  };

  const bodyString = JSON.stringify(payload);
  const signature = signPayload(bodyString, secret);

  const syncEventResult = await client.mutation({
    createTftSyncEvent: {
      __args: {
        data: {
          direction: 'TFT_TO_PARTNERS',
          opportunityName: opp.name as string,
          tftOpportunityId,
          payloadJson: payload,
          status: 'PENDING',
          attemptCount: 1,
        },
      },
      id: true,
    },
  } as any);
  const syncEventId = (syncEventResult as any).createTftSyncEvent?.id as string;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SYNC_SIGNATURE_HEADER]: signature,
      },
      body: bodyString,
    });

    const responseBody = (await response.json()) as { ok: boolean; reason?: string };

    if (!responseBody.ok) {
      throw new Error(
        responseBody.reason ?? `partners returned ok=false (HTTP ${response.status})`,
      );
    }

    await Promise.all([
      client.mutation({
        updateTftSyncEvent: {
          __args: { id: syncEventId, data: { status: 'OK' } },
          id: true,
        },
      } as any),
      client.mutation({
        updateOpportunity: {
          __args: { id: input.opportunityId, data: { partnerSyncRequest: 'SYNCED' } },
          id: true,
        },
      } as any),
    ]);

    return { ok: true, syncEventId };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await Promise.all([
      client.mutation({
        updateTftSyncEvent: {
          __args: { id: syncEventId, data: { status: 'FAILED', error: errorMessage } },
          id: true,
        },
      } as any),
      client.mutation({
        updateOpportunity: {
          __args: { id: input.opportunityId, data: { partnerSyncRequest: 'FAILED' } },
          id: true,
        },
      } as any),
    ]);
    return { ok: false, syncEventId, reason: errorMessage };
  }
}
