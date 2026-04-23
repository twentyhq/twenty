import { type CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type APIsOAuthState = {
  transientToken?: string;
  redirectLocation?: string;
  calendarVisibility?: CalendarChannelVisibility;
  messageVisibility?: MessageChannelVisibility;
  skipMessageChannelConfiguration?: boolean;
};
