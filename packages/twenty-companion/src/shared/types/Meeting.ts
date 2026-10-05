export type Meeting = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  url: string | null;
  recordingEnabled: boolean;
  usesCalendarBot: boolean;
};
