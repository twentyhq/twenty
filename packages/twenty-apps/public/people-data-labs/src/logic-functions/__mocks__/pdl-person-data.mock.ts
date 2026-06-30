import { type PdlPersonData } from 'src/types/pdl-person-data';

export const PDL_PERSON_DATA_MOCK: PdlPersonData = {
  id: 'pdl-person-1',
  first_name: 'Jane',
  last_name: 'Doe',
  work_email: 'jane.doe@acme.com',
  personal_emails: ['jane@personal.com'],
  job_title: 'Chief Executive Officer',
  linkedin_url: 'https://linkedin.com/in/janedoe',
  industry: 'accounting',
  job_title_role: 'engineering',
  job_title_levels: ['cxo', 'not-a-level'],
  inferred_salary: '45,000-55,000',
  job_company_size: '11-50',
  skills: ['leadership', 'strategy', 'leadership'],
  experience: [{ company: { name: 'Acme' } }],
  birth_date: '1990',
  location_locality: 'San Francisco',
  location_region: 'California',
  location_postal_code: '94107',
  location_country: 'United States',
};
