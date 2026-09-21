export type PeopleDataLabsCompanyData = {
  id?: string | null;
  name?: string | null;
  display_name?: string | null;
  legal_name?: string | null;
  alternative_names?: string[] | null;
  alternative_domains?: string[] | null;

  website?: string | null;
  linkedin_url?: string | null;
  linkedin_id?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  profiles?: string[] | null;

  industry?: string | null;
  industry_v2?: string | null;
  naics?: unknown[] | null;
  sic?: unknown[] | null;
  tags?: string[] | null;
  type?: string | null;
  ticker?: string | null;
  mic_exchange?: string | null;

  size?: string | null;
  employee_count?: number | null;
  employee_count_by_country?: Record<string, unknown> | null;
  founded?: number | null;

  summary?: string | null;
  headline?: string | null;

  total_funding_raised?: number | null;
  latest_funding_stage?: string | null;
  funding_stages?: string[] | null;
  last_funding_date?: string | null;
  number_funding_rounds?: number | null;

  location?: {
    street_address?: string | null;
    address_line_2?: string | null;
    locality?: string | null;
    region?: string | null;
    postal_code?: string | null;
    country?: string | null;
    continent?: string | null;
    metro?: string | null;
    geo?: string | null;
  } | null;
};
