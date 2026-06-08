import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { PdlRecordNotFoundError } from 'src/logic-functions/errors/pdl-record-not-found-error';
import { buildSkippedResult } from 'src/logic-functions/utils/build-skipped-result';
import { toText } from 'src/logic-functions/utils/to-text';
import { isWithinTtl } from 'src/logic-functions/utils/is-within-ttl';
import { mapCompany } from 'src/logic-functions/utils/map-company';
import { nowIso } from 'src/logic-functions/utils/now-iso';
import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { isEmptyAddress } from 'src/logic-functions/utils/is-empty-address';
import { isEmptyLinks } from 'src/logic-functions/utils/is-empty-links';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';
import { readCompany } from 'src/logic-functions/utils/read-company';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { type EnrichInput } from 'src/types/enrich-input';
import { type EnrichResult } from 'src/types/enrich-result';
import { type PdlCompanyData } from 'src/types/pdl-company-data';
import { type PdlCompanyEnrichParams } from 'src/types/pdl-company-enrich-params';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

const COMPANY_EMPTY_CHECKS = {
  name: isEmptyText,
  domainName: isEmptyLinks,
  linkedinLink: isEmptyLinks,
  address: isEmptyAddress,
};

export const enrichCompanyCore = async (
  input: EnrichInput,
  client: CoreApiClient = new CoreApiClient(),
): Promise<EnrichResult> => {
  const { recordId, force } = input;

  if (!isNonEmptyString(recordId)) {
    throw new PdlInvalidInputError('recordId is required');
  }

  const node = await readCompany(client, recordId);
  if (!isDefined(node)) {
    throw new PdlRecordNotFoundError({
      objectNameSingular: 'Company',
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
  const website = toText(node.domainName?.primaryLinkUrl);
  const name = toText(node.name);

  const matchParams: PdlCompanyEnrichParams = isDefined(existingPdlId)
    ? { pdlId: existingPdlId }
    : pruneUndefined({ website, name });

  if (Object.keys(matchParams).length === 0) {
    return buildSkippedResult(
      recordId,
      'No usable identifier (domain or name) to match against PDL.',
    );
  }

  const outcome = await enrichCompany(matchParams);
  const enrichedAt = nowIso();

  if (outcome.outcome === 'not_found') {
    await client.mutation({
      updateCompany: {
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
      updateCompany: {
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

  const mapped = mapCompany(outcome.data as PdlCompanyData);
  const writableStandard = pickWritableStandard(
    mapped.standard,
    node as unknown as Record<string, unknown>,
    COMPANY_EMPTY_CHECKS,
  );

  const data = pruneUndefined({
    ...writableStandard,
    ...mapped.pdl,
    pdlRawPayload: outcome.data,
    pdlLastEnrichedAt: enrichedAt,
    pdlEnrichmentStatus: 'MATCHED',
  });

  await client.mutation({
    updateCompany: { __args: { id: recordId, data }, id: true },
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
