export interface UserData {
  timestamp: string;
  document_location: string;
  document_title: string;
  scroll_depth: number;
  referrer: string;
  time_spent: number;
  user_events_count?: number;
}

export interface Session {
  session_id: string;
  timestamp: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  visitor_city?: string;
  visitor_country?: string;
  session_duration: number;
  session_time: number;
  user_data: UserData[];
}

export interface WebmeticCompany {
  company_id: string;
  company_name: string;
  company_url: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  phone_number?: string;
  email_address?: string;
  lead_score?: number;
  employee_count?: string;
  nace_code?: string;
  linkedin?: string;
  short_description_en?: string;
  sessions: Session[];
}

export interface WebmeticResponse {
  pagination: Array<{
    total: number;
    page_total: number;
    current: number;
  }>;
  result: WebmeticCompany[];
}
