import {
  type COMPANY_ENRICHMENT_KEY,
  type CompanyEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/company-enrichment-key-value.type';
import {
  type PERSON_ENRICHMENT_KEY,
  type PersonEnrichmentKeyValueTypeMap,
} from 'src/engine/core-modules/company-enrichment/types/person-enrichment-key-value.type';

export type GettingStartedSelectionContext = {
  isWorkEmail: boolean | null;
  hasConnectedMailbox: boolean | null;
  hasInstalledFeaturedApp: boolean | null;
  companyEnrichment:
    | CompanyEnrichmentKeyValueTypeMap[typeof COMPANY_ENRICHMENT_KEY]
    | null;
  personEnrichment:
    | PersonEnrichmentKeyValueTypeMap[typeof PERSON_ENRICHMENT_KEY]
    | null;
};
