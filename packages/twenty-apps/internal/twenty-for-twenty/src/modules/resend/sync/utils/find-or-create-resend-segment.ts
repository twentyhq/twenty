import type { Resend } from 'resend';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from '@utils/is-defined';

import { findRecordByResendId } from '@modules/resend/shared/utils/find-record-by-resend-id';
import { forEachPage } from '@modules/resend/shared/utils/for-each-page';

export const findOrCreateResendSegment = async (
  resend: Resend,
  client: CoreApiClient,
  name: string,
): Promise<string> => {
  let unlinkedMatchId: string | undefined;

  await forEachPage(
    (paginationParameters) => resend.segments.list(paginationParameters),
    async (pageSegments) => {
      for (const candidate of pageSegments) {
        if (candidate.name !== name) {
          continue;
        }

        const linkedRecordId = await findRecordByResendId(
          client,
          'resendSegments',
          candidate.id,
        );

        if (!isDefined(linkedRecordId)) {
          unlinkedMatchId = candidate.id;

          return { ok: true, stop: true };
        }
      }

      return { ok: true };
    },
    'segments',
  );

  if (isDefined(unlinkedMatchId)) {
    return unlinkedMatchId;
  }

  const { data, error } = await resend.segments.create({ name });

  if (isDefined(error) || !isDefined(data)) {
    throw new Error(
      `Failed to create Resend segment: ${JSON.stringify(error)}`,
    );
  }

  return data.id;
};
