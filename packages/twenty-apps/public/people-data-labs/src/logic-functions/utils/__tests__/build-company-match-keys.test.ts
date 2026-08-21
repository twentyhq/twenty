import { describe, expect, it } from 'vitest';

import { buildCompanyMatchKeys } from 'src/logic-functions/utils/build-company-match-keys';
import { type PdlPersonData } from 'src/types/pdl-person-data';

describe('buildCompanyMatchKeys', () => {
  it('extracts and trims the company identifiers from PDL data', () => {
    const keys = buildCompanyMatchKeys({
      job_company_id: '  pdl-co-1 ',
      job_company_website: 'acme.com',
      job_company_linkedin_url: 'https://linkedin.com/company/acme',
      job_company_name: 'Acme',
    } as PdlPersonData);

    expect(keys).toEqual({
      pdlId: 'pdl-co-1',
      website: 'acme.com',
      linkedinUrl: 'linkedin.com/company/acme',
      name: 'Acme',
    });
  });

  it('omits identifiers PDL did not return or that are blank', () => {
    expect(
      buildCompanyMatchKeys({
        job_company_name: '   ',
        job_company_website: 'acme.com',
      } as PdlPersonData),
    ).toEqual({ website: 'acme.com' });
  });

  it('returns an empty object when no company identifiers are present', () => {
    expect(buildCompanyMatchKeys({} as PdlPersonData)).toEqual({});
  });
});
