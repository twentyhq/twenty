import { type RoutePayload } from 'twenty-sdk/define';
import { z } from 'zod';

import {
  MIN_PITCH_LENGTH,
  PITCHABLE_STATES,
} from 'src/modules/application/apply/constants/apply-to-brief.constants';
import { createApplication } from 'src/modules/application/apply/graphql/mutations/create-application';
import { findOpportunityForApply } from 'src/modules/application/apply/graphql/queries/find-opportunity-for-apply';
import { type ApplyToBriefResult } from 'src/modules/application/apply/types/apply-to-brief.types';
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

const applyToBriefSchema = z.object({
  opportunityId: z.string().min(1),
  pitch: z.string(),
});

export const applyToBrief = async (
  event: Pick<RoutePayload<unknown>, 'body' | 'headers'>,
): Promise<ApplyToBriefResult> => {
  const resolved = await resolvePartnerFromForwardedToken(event);
  if ('error' in resolved) return errorResponse(resolved.error);

  const parsed = applyToBriefSchema.safeParse(event.body);
  if (!parsed.success) return errorResponse('BAD_REQUEST');

  const { opportunityId, pitch } = parsed.data;

  try {
    const client = buildAppClient();

    const briefs = await findOpportunityForApply(client, opportunityId);
    const brief = briefs.opportunities?.edges?.[0]?.node;
    if (!brief || brief.isListed !== true)
      return errorResponse('BRIEF_NOT_OPEN');

    const trimmedPitch = pitch.trim();
    if (trimmedPitch.length < MIN_PITCH_LENGTH)
      return errorResponse('PITCH_TOO_SHORT');

    const duplicates = await findDuplicateApplication(
      client,
      opportunityId,
      resolved.partnerId,
    );
    const existing = duplicates.applications?.edges?.[0]?.node;
    if (existing?.id) {
      if (isNonEmptyString(existing.pitch))
        return errorResponse('ALREADY_APPLIED');

      // Fill the pitch in place and leave the state alone — an INVITED row records that
      // Twenty pushed this brief at the partner. Guard on the state rather than on the
      // brief being listed: the WON/DECLINED cascade fires on Opportunity.partner, which
      // is not coupled to isListed, so a decided row can still sit under a listed brief.
      if (!PITCHABLE_STATES.some((state) => state === existing.state)) {
        return errorResponse('BRIEF_NOT_OPEN');
      }

      await updateApplication(client, existing.id, { pitch: trimmedPitch });
      return { ok: true, applicationId: existing.id };
    }

    // on-application-set-name fires on application.updated only, so an insert that already
    // carries partnerId never triggers it — the label must be written here.
    const created = await createApplication(client, {
      opportunityId,
      partnerId: resolved.partnerId,
      partnerUserId: resolved.workspaceMemberId,
      pitch: trimmedPitch,
      name: buildApplicationName(resolved.partnerName, brief.name),
    });

    const applicationId = created.createApplication?.id;
    if (!isNonEmptyString(applicationId)) {
      return failureResponse(
        'apply-to-brief',
        new Error('createApplication returned no id'),
      );
    }

    return { ok: true, applicationId };
  } catch (err) {
    return failureResponse('apply-to-brief', err);
  }
};
