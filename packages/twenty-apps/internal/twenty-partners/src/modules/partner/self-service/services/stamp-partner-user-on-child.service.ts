import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getPartnerOwner } from 'src/modules/shared/graphql/queries/get-partner-owner';
import {
  getApplicationPartnerUser,
  getPartnerContentPartnerUser,
  getPartnerLinkPartnerUser,
  getPartnerServicePartnerUser,
} from 'src/modules/shared/graphql/queries/get-child-partner-user';
import { updateApplicationPartnerUser } from 'src/modules/shared/graphql/mutations/update-application-partner-user';
import { updatePartnerContentPartnerUser } from 'src/modules/shared/graphql/mutations/update-partner-content-partner-user';
import { updatePartnerLinkPartnerUser } from 'src/modules/shared/graphql/mutations/update-partner-link-partner-user';
import { updatePartnerServicePartnerUser } from 'src/modules/shared/graphql/mutations/update-partner-service-partner-user';

export type PartnerChildObject =
  | 'partnerLink'
  | 'partnerService'
  | 'partnerContent'
  | 'application';

const CHILD_ACCESSORS = {
  partnerLink: { read: getPartnerLinkPartnerUser, write: updatePartnerLinkPartnerUser },
  partnerService: { read: getPartnerServicePartnerUser, write: updatePartnerServicePartnerUser },
  partnerContent: { read: getPartnerContentPartnerUser, write: updatePartnerContentPartnerUser },
  application: { read: getApplicationPartnerUser, write: updateApplicationPartnerUser },
} as const;

export const stampPartnerUserFromPartner = async (
  client: CoreApiClient,
  partnerId: string,
  childObject: PartnerChildObject,
  childId: string,
): Promise<void> => {
  const partnerUserId = (await getPartnerOwner(client, partnerId)).partner
    ?.partnerUserId;
  if (!partnerUserId) return;

  const { read, write } = CHILD_ACCESSORS[childObject];
  const child = await read(client, childId);

  if (!child) return;
  if (child.partnerUserId === partnerUserId) return;

  await write(client, childId, partnerUserId);
};
