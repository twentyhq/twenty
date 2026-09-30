import { msg, t } from '@lingui/core/macro';
import {
  IconLogin2,
  IconServer,
  IconSpy,
  IconTimelineEvent,
  IconUserPlus,
  IconWorld,
} from 'twenty-ui/icon';

import { LOG_CONSOLE_ACTOR_FILTER_FIELD } from '@/log-console/constants/LogConsoleActorFilterField';
import { type LogConsoleFilterField } from '@/log-console/types/LogConsoleFilterField';

export const LOG_CONSOLE_SECURITY_FILTER_FIELDS: LogConsoleFilterField[] = [
  {
    id: 'event',
    label: msg`Event`,
    Icon: IconTimelineEvent,
    serverField: 'event',
    getOptions: () => [
      {
        label: t`Sessions`,
        values: ['AuthSession'],
        startIcon: <IconLogin2 />,
      },
      {
        label: t`Impersonation`,
        values: ['Impersonation'],
        startIcon: <IconSpy />,
      },
      {
        label: t`Signed up`,
        values: ['User Signup'],
        startIcon: <IconUserPlus />,
      },
      {
        label: t`Custom domain`,
        values: ['Custom Domain Activated', 'Custom Domain Deactivated'],
        startIcon: <IconWorld />,
      },
      {
        label: t`Server administrator access updated`,
        values: ['ServerAdminAccessChanged'],
        startIcon: <IconServer />,
      },
    ],
  },
  LOG_CONSOLE_ACTOR_FILTER_FIELD,
];
