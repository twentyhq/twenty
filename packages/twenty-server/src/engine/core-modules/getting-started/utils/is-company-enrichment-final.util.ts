import { isDefined } from 'twenty-shared/utils';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import {
  type COMPANY_ENRICHMENT_ATTEMPT_KEY,
  type CompanyEnrichmentAttemptKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-attempt-key-value.type';

export const isCompanyEnrichmentFinal = ({
  companyEnrichment,
  companyEnrichmentAttempt,
}: {
  companyEnrichment: WorkspaceCompanyEnrichment | null;
  companyEnrichmentAttempt: Pick<
    CompanyEnrichmentAttemptKeyValueTypeMap[typeof COMPANY_ENRICHMENT_ATTEMPT_KEY],
    'outcome'
  > | null;
}): boolean => {
  if (
    !isDefined(companyEnrichmentAttempt) ||
    companyEnrichmentAttempt.outcome === 'transientError'
  ) {
    return false;
  }

  return (
    companyEnrichmentAttempt.outcome !== 'matched' ||
    isDefined(companyEnrichment)
  );
};
