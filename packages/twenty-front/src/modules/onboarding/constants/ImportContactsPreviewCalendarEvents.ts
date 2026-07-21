export type ImportContactsPreviewCalendarEvent = {
  id: string;
  title: string;
  time: string;
  color: 'orange' | 'sky';
};

export const IMPORT_CONTACTS_PREVIEW_CALENDAR_EVENTS = [
  {
    id: 'tim-apple-anthropic',
    title: 'Tim Apple x Anthropic',
    time: '10:00am',
    color: 'orange',
  },
  {
    id: 'dario-amodei',
    title: 'Dario Amodei',
    time: '3:00pm',
    color: 'sky',
  },
] satisfies ImportContactsPreviewCalendarEvent[];
