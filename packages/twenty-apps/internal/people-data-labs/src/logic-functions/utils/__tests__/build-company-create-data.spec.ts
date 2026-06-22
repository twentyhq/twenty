import { describe, expect, it } from 'vitest';

import { buildCompanyCreateData } from 'src/logic-functions/utils/build-company-create-data';
import { type PdlPersonData } from 'src/types/pdl-person-data';

describe('buildCompanyCreateData', () => {
  it('maps job_company_* onto Company standard and pdl fields', () => {
    const data = buildCompanyCreateData({
      job_company_id: 'pdl-co-1',
      job_company_name: 'Acme',
      job_company_website: 'acme.com',
      job_company_linkedin_url: 'https://linkedin.com/company/acme',
      job_company_industry: 'accounting',
      job_company_size: '11-50',
    } as PdlPersonData);

    expect(data).toMatchObject({
      name: 'Acme',
      pdlId: 'pdl-co-1',
      pdlIndustry: 'ACCOUNTING',
      pdlSizeRange: 'ELEVEN_TO_FIFTY',
    });
    expect(data.domainName).toMatchObject({ primaryLinkUrl: 'acme.com' });
    expect(data.linkedinLink).toMatchObject({
      primaryLinkUrl: 'linkedin.com/company/acme',
    });
  });

  it('omits fields PDL did not return and drops unknown select values', () => {
    const data = buildCompanyCreateData({
      job_company_name: 'Acme',
      job_company_industry: 'not-a-real-industry',
    } as PdlPersonData);

    expect(data).toEqual({ name: 'Acme' });
  });
});
