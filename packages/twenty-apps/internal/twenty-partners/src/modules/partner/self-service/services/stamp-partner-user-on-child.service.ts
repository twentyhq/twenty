import { type CoreApiClient } from 'twenty-client-sdk/core';

export type PartnerChildObject =
  | 'partnerLink'
  | 'partnerService'
  | 'partnerContent'
  | 'application';

type ChildRecord = { partnerUserId?: string | null } | null | undefined;

const CHILD_ACCESSORS: Record<
  PartnerChildObject,
  {
    read: (client: CoreApiClient, id: string) => Promise<ChildRecord>;
    write: (
      client: CoreApiClient,
      id: string,
      partnerUserId: string,
    ) => Promise<unknown>;
  }
> = {
  partnerLink: {
    read: (client, id) =>
      client
        .query({
          partnerLink: {
            __args: { filter: { id: { eq: id } } },
            id: true,
            partnerUserId: true,
          },
        })
        .then((res) => res.partnerLink),
    write: (client, id, partnerUserId) =>
      client.mutation({
        updatePartnerLink: { __args: { id, data: { partnerUserId } }, id: true },
      }),
  },
  partnerService: {
    read: (client, id) =>
      client
        .query({
          partnerService: {
            __args: { filter: { id: { eq: id } } },
            id: true,
            partnerUserId: true,
          },
        })
        .then((res) => res.partnerService),
    write: (client, id, partnerUserId) =>
      client.mutation({
        updatePartnerService: {
          __args: { id, data: { partnerUserId } },
          id: true,
        },
      }),
  },
  partnerContent: {
    read: (client, id) =>
      client
        .query({
          partnerContent: {
            __args: { filter: { id: { eq: id } } },
            id: true,
            partnerUserId: true,
          },
        })
        .then((res) => res.partnerContent),
    write: (client, id, partnerUserId) =>
      client.mutation({
        updatePartnerContent: {
          __args: { id, data: { partnerUserId } },
          id: true,
        },
      }),
  },
  application: {
    read: (client, id) =>
      client
        .query({
          application: {
            __args: { filter: { id: { eq: id } } },
            id: true,
            partnerUserId: true,
          },
        })
        .then((res) => res.application),
    write: (client, id, partnerUserId) =>
      client.mutation({
        updateApplication: { __args: { id, data: { partnerUserId } }, id: true },
      }),
  },
};

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

  const { read, write } = CHILD_ACCESSORS[childObject];
  const child = await read(client, childId);

  if (!child) return;
  if (child.partnerUserId === partnerUserId) return;

  await write(client, childId, partnerUserId);
};
