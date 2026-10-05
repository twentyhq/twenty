export type PeopleDataLabsPersonData = {
  id?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;

  job_title?: string | null;
  job_title_levels?: string[] | null;
  job_company_name?: string | null;
  job_company_website?: string | null;
  job_company_industry?: string | null;

  industry?: string | null;
  headline?: string | null;
  summary?: string | null;

  linkedin_url?: string | null;
  skills?: string[] | null;

  location_locality?: string | null;
  location_region?: string | null;
  location_country?: string | null;
};
