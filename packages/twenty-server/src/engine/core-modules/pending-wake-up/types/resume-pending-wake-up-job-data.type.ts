import { type PendingWakeUpEvent } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-event.type';

export type ResumePendingWakeUpJobData = {
  workspaceId: string;
  wakeUpId: string;
  // Absent when the wake-up's time came: a time condition elapsed or an event condition expired
  event?: PendingWakeUpEvent;
  // How many times the owner put the resolution off because it was not ready yet
  attempt?: number;
  // How many times the owner failed to read the event's record
  recordReadAttempt?: number;
};
