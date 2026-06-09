import { normalizeDomain } from 'src/logic-functions/utils/normalize-domain';
import { normalizeLinkedinUrl } from 'src/logic-functions/utils/normalize-linkedin-url';
import { toText } from 'src/logic-functions/utils/to-text';
import { type CompanyMatchKeys } from 'src/types/company-match-keys';
import { type PdlPersonData } from 'src/types/pdl-person-data';
import { pruneUndefined } from 'src/utils/prune-undefined';

export const buildCompanyMatchKeys = (data: PdlPersonData): CompanyMatchKeys =>
  pruneUndefined({
    pdlId: toText(data.job_company_id),
    website: normalizeDomain(data.job_company_website),
    linkedinUrl: normalizeLinkedinUrl(data.job_company_linkedin_url),
    name: toText(data.job_company_name),
  });
