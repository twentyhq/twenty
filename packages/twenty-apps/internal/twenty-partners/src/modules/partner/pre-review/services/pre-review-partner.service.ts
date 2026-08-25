import { type CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { runAgent } from 'twenty-sdk/logic-function';

import { PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createPreReviewNote } from 'src/modules/partner/pre-review/graphql/mutations/create-pre-review-note';
import { updatePartnerPreReviewVerdict } from 'src/modules/partner/pre-review/graphql/mutations/update-partner-pre-review-verdict';
import { findPartnerForPreReview } from 'src/modules/partner/pre-review/graphql/queries/find-partner-for-pre-review';
import { buildEvidencePack } from 'src/modules/partner/pre-review/mappers/build-evidence-pack.mapper';
import { buildPreReviewNote } from 'src/modules/partner/pre-review/mappers/build-pre-review-note.mapper';
import { collectPreReviewSources } from 'src/modules/partner/pre-review/services/collect-pre-review-sources.service';
import { type PartnerForPreReview } from 'src/modules/partner/pre-review/types/pre-review.type';
import { applyVerdictCap } from 'src/modules/partner/pre-review/utils/apply-verdict-cap.util';
import { parsePreReviewAgentResult } from 'src/modules/partner/pre-review/utils/parse-pre-review-agent-result.util';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';

type PartnerRecord = Awaited<
  ReturnType<typeof findPartnerForPreReview>
>['partner'];

const toPartnerForPreReview = (
  record: NonNullable<PartnerRecord>,
): PartnerForPreReview => ({
  id: record.id,
  name: record.name ?? null,
  city: record.city ?? null,
  country: record.country ?? null,
  typeOfTeam: record.typeOfTeam ?? null,
  partnerScope: record.partnerScope ?? null,
  skills: record.skills ?? null,
  twentyExperience: record.twentyExperience ?? null,
  twentyExperienceNotes: record.twentyExperienceNotes ?? null,
  applicationNotes: record.applicationNotes ?? null,
  hourlyRateAmountMicros: record.hourlyRate?.amountMicros ?? null,
  projectBudgetMinAmountMicros: record.projectBudgetMin?.amountMicros ?? null,
  websiteUrl: record.website?.primaryLinkUrl ?? null,
  linkedinUrl: record.linkedin?.primaryLinkUrl ?? null,
  proofUrl: record.twentyExperienceProofLink?.primaryLinkUrl ?? null,
});

export const preReviewPartner = async (
  client: CoreApiClient,
  partnerId: string,
): Promise<Record<string, unknown>> => {
  try {
    const { partner: record } = await findPartnerForPreReview(client, partnerId);

    if (!record?.id) return { graded: false, reason: 'not-found' };

    if (isNonEmptyString(record.preReviewVerdict)) {
      return { graded: false, reason: 'already-graded' };
    }

    const partner = toPartnerForPreReview(record);
    const sources = await collectPreReviewSources(partner);
    const evidencePack = buildEvidencePack({ partner, sources });

    const agentResult = await runAgent({
      agentUniversalIdentifier: PARTNER_PRE_REVIEW_AGENT_UNIVERSAL_IDENTIFIER,
      prompt: evidencePack.text,
    });

    if (!agentResult.success) return { graded: false, reason: 'agent-failed' };

    const agentOutput = parsePreReviewAgentResult(agentResult.result);

    if (agentOutput === null) {
      return { graded: false, reason: 'unparsable-agent-result' };
    }

    const verdict = applyVerdictCap({
      verdict: agentOutput.verdict,
      hasVerifiableProof: evidencePack.hasVerifiableProof,
    });

    // Note first, verdict last: an empty verdict is the inbox's "did not run"
    // signal, so a half-written pre-review must leave the verdict empty.
    const { title, markdown } = buildPreReviewNote({
      verdict,
      agentOutput,
      evidencePack,
    });

    const noteId = await createPreReviewNote(client, {
      partnerId,
      title,
      markdown,
    });

    await updatePartnerPreReviewVerdict(
      client,
      partnerId,
      verdict as CoreSchema.PartnerUpdateInput['preReviewVerdict'],
    );

    return { graded: true, verdict, noteId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`pre-review-partner failed for ${partnerId}: ${message}`);

    return { graded: false, reason: 'error', message };
  }
};
