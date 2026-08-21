import { type CoreApiClient } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import {
  type ApplyRefusalReason,
  MIN_PITCH_LENGTH,
} from 'src/modules/application/apply/constants/apply-to-brief.constants';
import { createApplication } from 'src/modules/application/apply/graphql/mutations/create-application';
import { findOpportunityForApply } from 'src/modules/application/apply/graphql/queries/find-opportunity-for-apply';
import { findPartnerName } from 'src/modules/application/apply/graphql/queries/find-partner-name';
import { updateApplication } from 'src/modules/application/graphql/mutations/update-application';
import { findDuplicateApplication } from 'src/modules/application/graphql/queries/find-duplicate-application';
import { buildApplicationName } from 'src/modules/application/utils/build-application-name';
import {
  buildAppClient,
  errorResponse,
  failureResponse,
  resolvePartnerFromForwardedToken,
} from 'src/modules/shared/http/resolve-partner-from-request.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

export type ApplyToBriefResult =
  | { ok: true; applicationId: string }
  | { ok: false; reason: ApplyRefusalReason | string };

const applyToBriefSchema = z.object({
  opportunityId: z.string().min(1),
  pitch: z.string(),
});

// A partner who pastes a stale brief id must see BRIEF_NOT_OPEN, never the opaque failure
// message, so a read that fails for any reason counts as "no brief".
const loadBrief = async (client: CoreApiClient, opportunityId: string) => {
  try {
    const result = await findOpportunityForApply(client, opportunityId);
    return result.opportunities?.edges?.[0]?.node ?? null;
  } catch {
    return null;
  }
};

export const applyToBrief = async (
  event: RoutePayload<unknown>,
): Promise<ApplyToBriefResult> => {
  const resolved = await resolvePartnerFromForwardedToken(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = applyToBriefSchema.safeParse(event.body);
  if (!parsed.success) return errorResponse('BRIEF_NOT_OPEN');

  const { opportunityId, pitch } = parsed.data;

  try {
    const client = buildAppClient();

    const brief = await loadBrief(client, opportunityId);
    if (!brief || brief.isListed !== true) return errorResponse('BRIEF_NOT_OPEN');

    const trimmedPitch = pitch.trim();
    if (trimmedPitch.length < MIN_PITCH_LENGTH) return errorResponse('PITCH_TOO_SHORT');

    const duplicates = await findDuplicateApplication(client, opportunityId, resolved.partnerId);
    const existing = duplicates.applications?.edges?.[0]?.node;
    if (existing?.id) {
      if (isNonEmptyString(existing.pitch)) return errorResponse('ALREADY_APPLIED');

      // Fill the pitch of an INVITED row in place and leave its state alone — the state
      // records that Twenty pushed this brief at the partner. No extra guard is needed for
      // late-stage rows: stamping introSentAt unlists the brief, so INTRODUCED / WON /
      // DECLINED rows fail the isListed check above with BRIEF_NOT_OPEN.
      await updateApplication(client, existing.id, { pitch: trimmedPitch });
      return { ok: true, applicationId: existing.id };
    }

    const partner = (await findPartnerName(client, resolved.partnerId)).partners?.edges?.[0]?.node;

    // on-application-set-name fires on application.updated only, so an insert that already
    // carries partnerId never triggers it — the label must be written here.
    const created = await createApplication(client, {
      opportunityId,
      partnerId: resolved.partnerId,
      partnerUserId: resolved.workspaceMemberId,
      pitch: trimmedPitch,
      name: buildApplicationName(partner?.name, brief.name),
    });

    const applicationId = created.createApplication?.id;
    if (!isNonEmptyString(applicationId)) {
      return failureResponse('apply-to-brief', new Error('createApplication returned no id'));
    }

    return { ok: true, applicationId };
  } catch (err) {
    return failureResponse('apply-to-brief', err);
  }
};
