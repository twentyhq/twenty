import { enqueueJobs, kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_ENRICH_PERSON_JOB_LIMITER } from 'src/constants/linkedin-enrich-person-job-limiter.constant';
import { LINKEDIN_ENRICH_PERSON_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LinkedinEnrichPersonJobPayload } from 'src/logic-functions/types/linkedin-enrich-person-job-payload.type';
import { buildLinkedinProfileHandle } from 'src/logic-functions/utils/build-linkedin-profile-handle.util';
import { getLinkedinEnrichedPersonKey } from 'src/logic-functions/utils/get-linkedin-enriched-person-key.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

// Per day: finished jobs keep their id for a while, and a person skipped once the lookups ran out must be retried
const getLinkedinEnrichPersonJobId = (personId: string) =>
  `linkedin-enrich-person-${personId}-${new Date().toISOString().slice(0, 10)}`;

export const enqueueLinkedinPersonEnrichmentJobs = async ({
  unipileAccountId,
  counterparts,
  personIdByHandle,
}: {
  unipileAccountId: string;
  counterparts: UnipileUser[];
  personIdByHandle: Map<string, string>;
}): Promise<void> => {
  try {
    const payloadByPersonId = new Map<string, LinkedinEnrichPersonJobPayload>();

    for (const counterpart of counterparts) {
      const personId = personIdByHandle.get(
        buildLinkedinProfileHandle(counterpart),
      );

      if (
        isDefined(personId) &&
        !payloadByPersonId.has(personId) &&
        !(await kv.get<boolean>(getLinkedinEnrichedPersonKey(personId)))
      ) {
        payloadByPersonId.set(personId, {
          unipileAccountId,
          personId,
          providerUserId: counterpart.id,
        });
      }
    }

    if (payloadByPersonId.size === 0) {
      return;
    }

    await enqueueJobs({
      logicFunctionUniversalIdentifier:
        LINKEDIN_ENRICH_PERSON_UNIVERSAL_IDENTIFIER,
      jobs: [...payloadByPersonId.values()].map((payload) => ({
        jobId: getLinkedinEnrichPersonJobId(payload.personId),
        payload,
      })),
      limiter: LINKEDIN_ENRICH_PERSON_JOB_LIMITER,
    });
  } catch (error) {
    console.warn(
      `[linkedin] could not queue the enrichment of people: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};
