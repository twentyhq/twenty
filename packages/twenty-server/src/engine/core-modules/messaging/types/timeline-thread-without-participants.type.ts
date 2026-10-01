import { type TimelineThreadDTO } from 'src/engine/core-modules/messaging/dtos/timeline-thread.dto';

export type TimelineThreadWithoutParticipants = Omit<
  TimelineThreadDTO,
  'firstParticipant' | 'lastTwoParticipants' | 'participantCount' | 'read'
>;
