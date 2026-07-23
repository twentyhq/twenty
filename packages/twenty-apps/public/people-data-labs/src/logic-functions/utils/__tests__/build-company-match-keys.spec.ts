import { describe, expect, it } from 'vitest';

import { buildCompanyMatchKeys } from 'src/logic-functions/utils/build-company-match-keys';
import { type PeopleDataLabsPersonData } from 'twenty-shared/people-data-labs';
describe('buildCompanyMatchKeys', () => {
  it('extracts and trims the company identifiers from PDL data', () => {
    const keys = buildCompanyMatchKeys({
      job_company_id: '  pdl-co-1 ',
      job_company_website: 'acme.com',
      job_company_linkedin_url: 'https://linkedin.com/company/acme',
      job_company_name: 'Acme',
    } as PeopleDataLabsPersonData);

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
      } as PeopleDataLabsPersonData),
    ).toEqual({ website: 'acme.com' });
  });

  it('returns an empty object when no company identifiers are present', () => {
    expect(buildCompanyMatchKeys({} as PeopleDataLabsPersonData)).toEqual({});
  });
});
