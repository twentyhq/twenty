import { type Meeting } from './Meeting';
import { type Recording } from './Recording';

export type Agenda = {
  workspace: { id: string; name: string; logoUrl?: string };
  meetings: Meeting[];
  recordings: Recording[];
  calendarConnected: boolean;
};
