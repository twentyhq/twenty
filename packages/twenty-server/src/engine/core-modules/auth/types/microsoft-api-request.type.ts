import { Request } from 'express';

import { CalendarChannelVisibility } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type MicrosoftAPIsRequest = Omit<
  Request,
  'user' | 'workspace' | 'workspaceMetadataVersion'
> & {
  user: {
    firstName?: string | null;
    lastName?: string | null;
    emails: { value: string }[];
    picture: string | null;
    workspaceInviteHash?: string;
    accessToken: string;
    refreshToken: string;
    transientToken: string;
    redirectLocation?: string;
    calendarVisibility?: CalendarChannelVisibility;
    messageVisibility?: MessageChannelVisibility;
  };
};
