import { defineLogicFunction } from 'twenty-sdk/define';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS } from 'src/constants/linkedin-attachment-deadline-margin-milliseconds.constant';
import { LINKEDIN_ENRICH_PERSON_TIMEOUT_SECONDS } from 'src/constants/linkedin-enrich-person-timeout-seconds.constant';
import { LINKEDIN_ENRICH_PERSON_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinEnrichPersonJobPayload } from 'src/logic-functions/types/linkedin-enrich-person-job-payload.type';
import { enrichLinkedinPerson } from 'src/logic-functions/utils/enrich-linkedin-person.util';
import { isTransientLinkedinError } from 'src/logic-functions/utils/is-transient-linkedin-error.util';
import { UnipileRateLimitError } from 'src/unipile/utils/request-unipile.util';

export const linkedinEnrichPersonHandler = async (
  payload: LinkedinEnrichPersonJobPayload,
): Promise<void> => {
  try {
    await enrichLinkedinPerson({
      ...payload,
      deadlineAtMs:
        Date.now() +
        LINKEDIN_ENRICH_PERSON_TIMEOUT_SECONDS * 1000 -
        LINKEDIN_ATTACHMENT_DEADLINE_MARGIN_MILLISECONDS,
    });
  } catch (error) {
    // The person is queued again the next time they show up in a conversation
    if (error instanceof UnipileRateLimitError) {
      console.warn(
        `[linkedin] enrichment of person ${payload.personId} skipped: ${error.message}`,
      );

      return;
    }

    if (isTransientLinkedinError(error)) {
      throw new RetryableLogicFunctionError(
        error instanceof Error ? error.message : String(error),
      );
    }

    throw error;
  }
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_ENRICH_PERSON_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-enrich-person',
  description:
    'Fills the empty job title, email and phone of one person from their LinkedIn profile.',
  timeoutSeconds: LINKEDIN_ENRICH_PERSON_TIMEOUT_SECONDS,
  handler: linkedinEnrichPersonHandler,
});
