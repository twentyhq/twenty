import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  CALENDAR_CRON_INTERVAL_MINUTES_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  logoUrl: 'public/logo.png',
  screenshots: ['public/gallery/cover.png'],
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    CALENDAR_CRON_INTERVAL_MINUTES: {
      universalIdentifier:
        CALENDAR_CRON_INTERVAL_MINUTES_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Interval in minutes between runs of the on-calendar-event-started cron.',
      value: '5',
      isSecret: false,
    },
  },
});
