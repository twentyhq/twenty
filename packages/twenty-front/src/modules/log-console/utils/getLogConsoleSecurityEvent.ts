import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type IconComponent,
  IconForbid,
  IconLogin2,
  IconLogout,
  IconServer,
  IconSpy,
  IconUserPlus,
  IconWorld,
} from 'twenty-ui/icon';
import { type TagColor } from 'twenty-ui/primitives/data-display';

import { type LogConsoleSeverity } from '@/log-console/types/LogConsoleSeverity';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export const getLogConsoleSecurityEvent = (
  entry: EventLogRecord,
):
  | {
      label: MessageDescriptor;
      color: TagColor;
      Icon: IconComponent;
      severity?: LogConsoleSeverity;
    }
  | undefined => {
  switch (entry.properties?.action ?? entry.event) {
    case 'user_signed_in':
      return { label: msg`Signed in`, color: 'blue', Icon: IconLogin2 };
    case 'user_signed_out':
      return { label: msg`Logged out`, color: 'gray', Icon: IconLogout };
    case 'session_revoked':
      return { label: msg`Session revoked`, color: 'orange', Icon: IconForbid };
    case 'attempt':
    case 'attempted':
    case 'login_token_attempt':
    case 'login_token_generated':
    case 'token_exchange_attempt':
      return {
        label: msg`Impersonation requested`,
        color: 'orange',
        Icon: IconSpy,
      };
    case 'token_exchange_success':
    case 'issued':
      return {
        label: msg`Impersonation started`,
        color: 'orange',
        Icon: IconSpy,
      };
    case 'ended':
      return {
        label: msg`Impersonation ended`,
        color: 'orange',
        Icon: IconSpy,
      };
    case 'login_token_failed':
    case 'token_exchange_failed':
      return {
        label: msg`Impersonation failed`,
        color: 'red',
        Icon: IconSpy,
        severity: 'error',
      };
    case 'User Signup':
      return { label: msg`Signed up`, color: 'green', Icon: IconUserPlus };
    case 'Custom Domain Activated':
      return {
        label: msg`Custom domain activated`,
        color: 'turquoise',
        Icon: IconWorld,
      };
    case 'Custom Domain Deactivated':
      return {
        label: msg`Custom domain deactivated`,
        color: 'orange',
        Icon: IconWorld,
      };
    case 'ServerAdminAccessChanged':
      return {
        label: msg`Server administrator access updated`,
        color: 'orange',
        Icon: IconServer,
        severity: 'warning',
      };
    default:
      return undefined;
  }
};
