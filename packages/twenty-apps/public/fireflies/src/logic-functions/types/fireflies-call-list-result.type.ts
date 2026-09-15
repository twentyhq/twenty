export type FirefliesCallSummary = {
  id: string;
  title: string | null;
  date: string | null;
  durationMinutes: number | null;
  participants: string[];
  hostEmail: string | null;
  transcriptUrl: string | null;
  meetingLink: string | null;
};

export type FirefliesCallListResult = {
  success: boolean;
  message: string;
  error?: string;
  calls?: FirefliesCallSummary[];
  count?: number;
};
