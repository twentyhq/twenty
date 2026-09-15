import { type Request } from 'express';

import {
  type CalendarChannelVisibility,
  type MessageChannelVisibility,
} from 'twenty-shared/types';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

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
    accessToken: PlaintextString;
    refreshToken: PlaintextString;
    transientToken: string;
    redirectLocation?: string;
    calendarVisibility?: CalendarChannelVisibility;
    messageVisibility?: MessageChannelVisibility;
    skipMessageChannelConfiguration?: boolean;
  };
};
