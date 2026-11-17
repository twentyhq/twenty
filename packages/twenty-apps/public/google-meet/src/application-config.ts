import { defineApplication } from 'twenty-sdk/define';

import {
  GOOGLE_CLIENT_ID_SERVER_VARIABLE_NAME,
  GOOGLE_CLIENT_SECRET_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME,
} from 'src/constants/google-meet.constant';
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  author: 'Twenty',
  category: 'Productivity',
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/google-meet',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  serverVariables: {
    [GOOGLE_CLIENT_ID_SERVER_VARIABLE_NAME]: {
      description: 'OAuth client ID from the Google Cloud project.',
      isSecret: false,
      isRequired: true,
    },
    [GOOGLE_CLIENT_SECRET_SERVER_VARIABLE_NAME]: {
      description: 'OAuth client secret from the Google Cloud project.',
      isSecret: true,
      isRequired: true,
    },
    [GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME]: {
      description:
        'Pub/Sub topic Google publishes Meet events to, such as projects/my-project/topics/twenty-google-meet.',
      isSecret: false,
      isRequired: true,
    },
  },
});
