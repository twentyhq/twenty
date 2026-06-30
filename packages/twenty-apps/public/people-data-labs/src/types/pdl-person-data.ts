export type PdlPersonData = {
  id?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  name_aliases?: string[] | null;

  work_email?: string | null;
  personal_emails?: string[] | null;
  emails?: ({ address?: string | null } | string)[] | null;
  recommended_personal_email?: string | null;

  mobile_phone?: string | null;
  phone_numbers?: string[] | null;

  job_title?: string | null;
  job_title_role?: string | null;
  job_title_sub_role?: string | null;
  job_title_class?: string | null;
  job_title_levels?: string[] | null;
  job_onet_code?: string | null;
  job_summary?: string | null;
  job_start_date?: string | null;
  inferred_years_experience?: number | null;
  inferred_salary?: string | null;
  industry?: string | null;

  job_company_id?: string | null;
  job_company_name?: string | null;
  job_company_website?: string | null;
  job_company_linkedin_url?: string | null;
  job_company_industry?: string | null;
  job_company_size?: string | null;

  linkedin_url?: string | null;
  linkedin_username?: string | null;
  linkedin_connections?: number | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  github_url?: string | null;

  headline?: string | null;
  summary?: string | null;
  skills?: string[] | null;
  interests?: string[] | null;
  experience?: unknown[] | null;
  education?: unknown[] | null;
  certifications?: unknown[] | null;
  profiles?: unknown[] | null;
  languages?: unknown[] | null;

  sex?: string | null;
  birth_year?: number | null;
  birth_date?: string | null;

  location_name?: string | null;
  location_street_address?: string | null;
  location_address_line_2?: string | null;
  location_locality?: string | null;
  location_region?: string | null;
  location_postal_code?: string | null;
  location_country?: string | null;
  location_metro?: string | null;
  location_geo?: string | null;
};
