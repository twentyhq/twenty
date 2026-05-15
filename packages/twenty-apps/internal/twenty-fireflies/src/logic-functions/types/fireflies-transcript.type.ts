export type FirefliesTranscriptSentence = {
  speaker_name: string | null;
  text: string;
  start_time: number | null;
};

export type FirefliesTranscript = {
  id: string;
  title: string | null;
  duration: number | null;
  meeting_link: string | null;
  participants: string[];
  organizer_email: string | null;
  sentences: FirefliesTranscriptSentence[] | null;
  calendar_id?: string | null;
  cal_id?: string | null;
  calendar_provider?: string | null;
};
