import { type PdlCompanyData } from 'src/types/pdl-company-data';

export const PDL_COMPANY_DATA_MOCK: PdlCompanyData = {
  id: 'pdl-company-1',
  display_name: 'Acme Corp',
  website: 'acme.com',
  linkedin_url: 'https://linkedin.com/company/acme',
  industry: 'accounting',
  type: 'private',
  size: '51-200',
  employee_count: 120,
  founded: 2001,
  total_funding_raised: 1234.5,
  latest_funding_stage: 'series_a',
  funding_stages: ['seed', 'series_a', 'not-a-stage'],
  last_funding_date: '2020-05',
  number_funding_rounds: 3,
  tags: ['saas', 'b2b'],
  naics: [{ naics_code: '541511' }],
  location: {
    locality: 'San Francisco',
    region: 'California',
    postal_code: '94107',
    country: 'United States',
    continent: 'north america',
  },
};
