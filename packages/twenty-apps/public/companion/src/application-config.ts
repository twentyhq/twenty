import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  COMPANION_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  COMPANION_TRANSCRIPT_PROVIDER_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  COMPANION_ADDITIONAL_SUMMARY_PROMPT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  category: 'Productivity',
  author: 'Twenty',
  applicationVariables: {
    DESKTOP_DOWNLOAD_URL: {
      universalIdentifier: 'e436eaee-c56e-4da4-834e-fd30a1ded1df',
      label: 'macOS download URL',
      description:
        'HTTPS link to the published Twenty installer for macOS (Apple silicon). Shown to workspace members in desktop setup. Leave empty until a release is available.',
      type: FieldType.TEXT,
      isSecret: false,
      value: '',
    },
    COMPANION_SUMMARY_ENABLED: {
      universalIdentifier:
        COMPANION_SUMMARY_ENABLED_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'AI summaries',
      description:
        'Generate summaries of desktop recordings using Twenty AI credits when billing is enabled.',
      type: FieldType.BOOLEAN,
      isSecret: false,
      value: true,
    },
    COMPANION_TRANSCRIPT_PROVIDER: {
      universalIdentifier:
        COMPANION_TRANSCRIPT_PROVIDER_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Transcript provider',
      description:
        'Speech recognition for desktop recordings. Gladia requires a provider key configured in Recall.',
      type: FieldType.SELECT,
      isSecret: false,
      options: [
        { label: 'Recall.ai', value: 'recallai_async' },
        { label: 'Gladia', value: 'gladia_v2_async' },
      ],
      value: 'recallai_async',
    },
    COMPANION_ADDITIONAL_SUMMARY_PROMPT: {
      universalIdentifier:
        COMPANION_ADDITIONAL_SUMMARY_PROMPT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'Additional summary instructions',
      description:
        'Optional instructions for the language, tone, or focus of meeting summaries.',
      type: FieldType.TEXT,
      isSecret: false,
    },
  },
  serverVariables: {
    RECALL_API_KEY: {
      description: 'Recall API key used to provision desktop uploads.',
      type: FieldType.TEXT,
      isSecret: true,
      isRequired: true,
    },
    RECALL_REGION: {
      description:
        'Recall region, for example eu-central-1. Defaults to eu-central-1.',
      type: FieldType.TEXT,
      isSecret: false,
    },
    RECALL_WEBHOOK_SECRET: {
      description:
        'Signing secret for the separate Desktop Recorder Recall webhook endpoint.',
      type: FieldType.TEXT,
      isSecret: true,
      isRequired: true,
    },
    COMPANION_RECORDING_RETENTION_HOURS: {
      description: 'Recall media retention in hours. Defaults to 166.',
      type: FieldType.NUMBER,
      isSecret: false,
    },
  },
});
