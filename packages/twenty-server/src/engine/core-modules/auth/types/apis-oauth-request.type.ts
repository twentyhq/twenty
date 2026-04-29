import { type Request } from 'express';

import {
  type CalendarChannelVisibility,
  type MessageChannelVisibility,
} from 'twenty-shared/types';

export type APIsOAuthRequest = Omit<
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
    skipMessageChannelConfiguration?: boolean;
  };
};
