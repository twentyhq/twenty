import { type RoutePayload } from 'twenty-sdk/define';

import { PROFILE_OPTIONS, type ProfileOptions } from 'src/modules/partner/self-service/constants/my-profile.constants';
import { findMyPartnerProfile } from 'src/modules/partner/self-service/graphql/queries/find-my-partner-profile';
import {
  mapMyProfilePayload,
  type MyProfilePayload,
} from 'src/modules/partner/self-service/mappers/get-my-partner-profile.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';

export type MyPartnerProfileResult =
  | { ok: true; profile: MyProfilePayload; options: ProfileOptions }
  | { ok: false; reason: string };

export const getMyPartnerProfile = async (
  event: RoutePayload<unknown>,
): Promise<MyPartnerProfileResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  try {
    const client = buildAppClient();
    const result = await findMyPartnerProfile(client, resolved.partnerId);
    const node = result.partners?.edges?.[0]?.node;

    if (!node) {
      return errorResponse('NO_PARTNER');
    }

    return { ok: true, profile: mapMyProfilePayload(node), options: PROFILE_OPTIONS };
  } catch (err) {
    return failureResponse('get-my-partner-profile', err);
  }
};
