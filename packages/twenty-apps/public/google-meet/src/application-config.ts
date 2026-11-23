import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  GOOGLE_CLIENT_ID_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME,
  GOOGLE_CLIENT_SECRET_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME,
  GOOGLE_MEET_PUBSUB_TOPIC_SERVER_VARIABLE_NAME,
} from 'src/constants/google-meet.constant';
import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  author: 'Twenty',
  category: 'Productivity',
  galleryImages: [
    'public/gallery/google-meet-cover-image-1.png',
    'public/gallery/google-meet-cover-image-2.png',
    'public/gallery/google-meet-cover-image-3.png',
  ],
  websiteUrl:
    'https://github.com/twentyhq/twenty/tree/main/packages/twenty-apps/public/google-meet',
  termsUrl: 'https://www.twenty.com/terms',
  emailSupport: 'contact@twenty.com',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    [GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_NAME]: {
      universalIdentifier:
        GOOGLE_MEET_AI_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'AI summaries',
      description:
        'Whether your calls without Gemini notes get an AI summary. Turn off to avoid AI credit usage.',
      isSecret: false,
      type: FieldType.BOOLEAN,
      scope: 'USER',
      value: true,
    },
  },
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
    [GOOGLE_MEET_PUBSUB_AUDIENCE_SERVER_VARIABLE_NAME]: {
      description:
        'Audience set on the Pub/Sub push subscription that delivers Meet events to Twenty.',
      isSecret: false,
      isRequired: true,
    },
    [GOOGLE_MEET_PUBSUB_SERVICE_ACCOUNT_EMAIL_SERVER_VARIABLE_NAME]: {
      description:
        'Email of the service account the Pub/Sub push subscription authenticates with.',
      isSecret: false,
      isRequired: true,
    },
  },
});
