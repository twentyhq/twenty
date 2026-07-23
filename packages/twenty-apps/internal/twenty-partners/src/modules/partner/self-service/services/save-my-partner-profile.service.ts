import { type RoutePayload } from 'twenty-sdk/define';

import { updatePartner } from 'src/modules/partner/self-service/graphql/mutations/update-partner';
import {
  buildPartnerUpdateData,
  saveProfileSchema,
  validateProfileOptionValues,
} from 'src/modules/partner/self-service/mappers/save-my-partner-profile.mapper';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromRequest,
} from 'src/modules/partner/self-service/services/resolve-partner-from-request.service';

export type SaveResult = { ok: true } | { ok: false; reason: string };

export const saveMyPartnerProfile = async (
  event: RoutePayload<unknown>,
): Promise<SaveResult> => {
  const resolved = await resolvePartnerFromRequest(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = saveProfileSchema.safeParse(event.body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message ?? 'invalid_input');
  }
  const input = parsed.data;

  const optionError = validateProfileOptionValues(input);
  if (optionError) return errorResponse(optionError.error);

  const data = buildPartnerUpdateData(input);

  try {
    const client = buildAppClient();
    await updatePartner(client, resolved.partnerId, data);
    return { ok: true };
  } catch (err) {
    return failureResponse('save-my-partner-profile', err);
  }
};
