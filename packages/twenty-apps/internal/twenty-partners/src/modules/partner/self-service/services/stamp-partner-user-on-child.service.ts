import { type CoreApiClient } from 'twenty-client-sdk/core';

export type PartnerChildObject = 'partnerLink' | 'partnerService' | 'partnerContent';

export const stampPartnerUserFromPartner = async (
  client: CoreApiClient,
  partnerId: string,
  childObject: PartnerChildObject,
  childId: string,
): Promise<void> => {
  const partnerRes = await client.query({
    partner: {
      __args: { filter: { id: { eq: partnerId } } },
      id: true,
      partnerUserId: true,
    },
  });

  const partnerUserId = partnerRes.partner?.partnerUserId;
  if (!partnerUserId) return;

  if (childObject === 'partnerLink') {
    const childRes = await client.query({
      partnerLink: {
        __args: { filter: { id: { eq: childId } } },
        id: true,
        partnerUserId: true,
      },
    });

    if (!childRes.partnerLink) return;
    if (childRes.partnerLink.partnerUserId === partnerUserId) return;

    await client.mutation({
      updatePartnerLink: {
        __args: { id: childId, data: { partnerUserId } },
        id: true,
      },
    });
    return;
  }

  if (childObject === 'partnerService') {
    const childRes = await client.query({
      partnerService: {
        __args: { filter: { id: { eq: childId } } },
        id: true,
        partnerUserId: true,
      },
    });

    if (!childRes.partnerService) return;
    if (childRes.partnerService.partnerUserId === partnerUserId) return;

    await client.mutation({
      updatePartnerService: {
        __args: { id: childId, data: { partnerUserId } },
        id: true,
      },
    });
    return;
  }

  const childRes = await client.query({
    partnerContent: {
      __args: { filter: { id: { eq: childId } } },
      id: true,
      partnerUserId: true,
    },
  });

  if (!childRes.partnerContent) return;
  if (childRes.partnerContent.partnerUserId === partnerUserId) return;

  await client.mutation({
    updatePartnerContent: {
      __args: { id: childId, data: { partnerUserId } },
      id: true,
    },
  });
};
