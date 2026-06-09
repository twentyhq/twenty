import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findOrCreateCurrentCompany } from 'src/logic-functions/utils/find-or-create-current-company';
import { isEmptyEmails } from 'src/logic-functions/utils/is-empty-emails';
import { isEmptyFullName } from 'src/logic-functions/utils/is-empty-full-name';
import { isEmptyLinks } from 'src/logic-functions/utils/is-empty-links';
import { isEmptyPhones } from 'src/logic-functions/utils/is-empty-phones';
import { isEmptyText } from 'src/logic-functions/utils/is-empty-text';
import { mapPerson } from 'src/logic-functions/utils/map-person';
import { pickWritableStandard } from 'src/logic-functions/utils/pick-writable-standard';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { type PersonNode } from 'src/types/person-node';
import { isDefined } from 'src/utils/is-defined';
import { pruneUndefined } from 'src/utils/prune-undefined';

const PERSON_EMPTY_CHECKS = {
  name: isEmptyFullName,
  emails: isEmptyEmails,
  phones: isEmptyPhones,
  jobTitle: isEmptyText,
  linkedinLink: isEmptyLinks,
};

export const buildPersonMatchedData = async (
  client: CoreApiClient,
  node: PersonNode,
  outcome: { likelihood?: number; data: PdlPersonData },
  enrichedAt: string,
): Promise<Record<string, unknown>> => {
  const mapped = mapPerson(outcome.data);
  const writableStandard = pickWritableStandard(
    mapped.standard,
    node as unknown as Record<string, unknown>,
    PERSON_EMPTY_CHECKS,
  );

  const currentCompanyId = isDefined(node.company?.id)
    ? undefined
    : await findOrCreateCurrentCompany(client, outcome.data);

  return pruneUndefined({
    ...writableStandard,
    ...mapped.pdl,
    companyId: currentCompanyId,
    pdlLikelihood: outcome.likelihood,
    pdlRawPayload: outcome.data,
    pdlLastEnrichedAt: enrichedAt,
    pdlEnrichmentStatus: 'MATCHED',
  });
};
