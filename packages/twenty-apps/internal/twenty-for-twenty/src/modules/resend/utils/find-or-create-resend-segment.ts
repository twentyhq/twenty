import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-shared/utils';

import { fetchAllPaginated } from 'src/modules/resend/utils/fetch-all-paginated';
import { findRecordByResendId } from 'src/modules/resend/utils/find-record-by-resend-id';

export const findOrCreateResendSegment = async (
  resend: Resend,
  client: CoreApiClient,
  name: string,
): Promise<string> => {
  const existingSegments = await fetchAllPaginated((params) =>
    resend.segments.list(params),
  );

  const candidates = existingSegments.filter(
    (segment) => segment.name === name,
  );

  for (const candidate of candidates) {
    const linkedRecordId = await findRecordByResendId(
      client,
      'resendSegments',
      candidate.id,
    );

    if (!isDefined(linkedRecordId)) {
      return candidate.id;
    }
  }

  const { data, error } = await resend.segments.create({ name });

  if (isDefined(error) || !isDefined(data)) {
    throw new Error(
      `Failed to create Resend segment: ${JSON.stringify(error)}`,
    );
  }

  return data.id;
};
