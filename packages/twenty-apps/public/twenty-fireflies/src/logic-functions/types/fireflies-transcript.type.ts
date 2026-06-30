export type FirefliesTranscriptSentence = {
  speaker_name: string | null;
  text: string;
  start_time: number | null;
};

export type FirefliesSummary = {
  overview: string | null;
  action_items: string | null;
  keywords: string[] | null;
  topics_discussed: string[] | null;
  short_summary: string | null;
};

export type FirefliesTranscript = {
  id: string;
  title: string | null;
  duration: number | null;
  meeting_link: string | null;
  participants: string[];
  organizer_email: string | null;
  host_email?: string | null;
  date?: number | null;
  transcript_url?: string | null;
  sentences?: FirefliesTranscriptSentence[] | null;
  summary?: FirefliesSummary | null;
  calendar_id?: string | null;
  cal_id?: string | null;
  calendar_type?: string | null;
};
