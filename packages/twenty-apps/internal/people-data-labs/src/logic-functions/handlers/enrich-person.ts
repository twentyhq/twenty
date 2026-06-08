import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { PdlRecordNotFoundError } from 'src/logic-functions/errors/pdl-record-not-found-error';
import { buildPersonNameParam } from 'src/logic-functions/utils/build-person-name-param';
import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';
import { findOrCreateCurrentCompany } from 'src/logic-functions/utils/find-or-create-current-company';
import { toText } from 'src/logic-functions/utils/to-text';
import { isWithinTtl } from 'src/logic-functions/utils/is-within-ttl';
import { mapPerson } from 'src/logic-functions/utils/map-person';
import { nowIso } from 'src/logic-functions/utils/now-iso';
import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { isEmptyEmails } from 'src/logic-functions/utils/is-empty-emails';
import { isEmptyFullName } from 'src/logic-functions/utils/is-empty-full-name';
import { isEmptyLinks } from 'src/logic-functions/utils/is-empty-links';
import { isEmptyPhones } from 'src/logic-functions/utils/is-empty-phones';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';
import { readPerson } from 'src/logic-functions/utils/read-person';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type EnrichInput } from 'src/types/enrich-input';
import { type EnrichResult } from 'src/types/enrich-result';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PdlPersonEnrichParams } from 'src/types/pdl-person-enrich-params';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

const DEFAULT_MIN_LIKELIHOOD = 2;
const WEAK_IDENTIFIER_MIN_LIKELIHOOD = 6;

const PERSON_EMPTY_CHECKS = {
  name: isEmptyFullName,
  emails: isEmptyEmails,
  phones: isEmptyPhones,
  jobTitle: isEmptyText,
  linkedinLink: isEmptyLinks,
};

export const enrichPersonCore = async (
  input: EnrichInput,
  client: CoreApiClient = new CoreApiClient(),
): Promise<EnrichResult> => {
  const { recordId, force } = input;

  if (!isNonEmptyString(recordId)) {
    throw new PdlInvalidInputError('recordId is required');
  }

  const node = await readPerson(client, recordId);
  if (!isDefined(node)) {
    throw new PdlRecordNotFoundError({
      objectNameSingular: 'Person',
      recordId,
    });
  }

  if (force !== true && isWithinTtl(node.pdlLastEnrichedAt)) {
    return buildSkippedResult(
      recordId,
      'Recently enriched; skipped (use force to re-run).',
    );
  }

  const existingPdlId = toText(node.pdlId);
  const profile = toText(node.linkedinLink?.primaryLinkUrl);
  const email = toText(node.emails?.primaryEmail);
  const name = buildPersonNameParam(node.name?.firstName, node.name?.lastName);
  const hasStrongIdentifier =
    isDefined(existingPdlId) || isDefined(profile) || isDefined(email);

  const matchParams: PdlPersonEnrichParams = isDefined(existingPdlId)
    ? { pdlId: existingPdlId }
    : pruneUndefined({ profile, email, name });

  if (Object.keys(matchParams).length === 0) {
    return buildSkippedResult(
      recordId,
      'No usable identifier (email, LinkedIn, or name) to match against PDL.',
    );
  }

  const minLikelihood =
    input.minLikelihood ??
    (hasStrongIdentifier
      ? DEFAULT_MIN_LIKELIHOOD
      : WEAK_IDENTIFIER_MIN_LIKELIHOOD);

  const outcome = await enrichPerson({ ...matchParams, minLikelihood });
  const enrichedAt = nowIso();

  if (outcome.outcome === 'not_found') {
    await client.mutation({
      updatePerson: {
        __args: {
          id: recordId,
          data: {
            pdlEnrichmentStatus: 'NOT_FOUND',
            pdlLastEnrichedAt: enrichedAt,
          },
        },
        id: true,
      },
    });

    return {
      success: true,
      recordId,
      status: 'NOT_FOUND',
      updatedFields: [],
      message: 'People Data Labs returned no confident match.',
    };
  }

  if (outcome.outcome === 'error') {
    await client.mutation({
      updatePerson: {
        __args: {
          id: recordId,
          data: pruneUndefined({ pdlEnrichmentStatus: 'ERROR' }),
        },
        id: true,
      },
    });

    return {
      success: false,
      recordId,
      status: 'ERROR',
      updatedFields: [],
      message: 'People Data Labs enrichment failed.',
      error: outcome.message,
    };
  }

  const mapped = mapPerson(outcome.data as PdlPersonData);
  const writableStandard = pickWritableStandard(
    mapped.standard,
    node as unknown as Record<string, unknown>,
    PERSON_EMPTY_CHECKS,
  );

  const currentCompanyId = isDefined(node.company?.id)
    ? undefined
    : await findOrCreateCurrentCompany(client, outcome.data as PdlPersonData);

  const data = pruneUndefined({
    ...writableStandard,
    ...mapped.pdl,
    companyId: currentCompanyId,
    pdlLikelihood: outcome.likelihood,
    pdlRawPayload: outcome.data,
    pdlLastEnrichedAt: enrichedAt,
    pdlEnrichmentStatus: 'MATCHED',
  });

  await client.mutation({
    updatePerson: { __args: { id: recordId, data }, id: true },
  });

  const updatedFields = Object.keys(data);

  return {
    success: true,
    recordId,
    status: 'MATCHED',
    updatedFields,
    message: `Enriched with People Data Labs (${updatedFields.length} fields).`,
  };
};
