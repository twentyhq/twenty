import { defineApplication } from 'twenty-sdk/define';

import {
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
  PARTNERS_PUBLIC_URL_VAR_UUID,
  PARTNERS_SYNC_SELF_ENDPOINT_VAR_UUID,
  PARTNERS_SYNC_SHARED_SECRET_VAR_UUID,
  TFT_API_KEY_VAR_UUID,
  TFT_API_URL_VAR_UUID,
  TFT_ECHO_ENDPOINT_VAR_UUID,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  applicationVariables: {
    PARTNER_APPLICATION_SECRET: {
      universalIdentifier: '2026a052-9f01-4d18-b6a7-31c3a5b1c7d2',
      description:
        'Shared secret required in the X-Application-Secret header on POST /partner-applications. Must match the website route\'s PARTNER_APPLICATION_SECRET env var. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: true,
    },
    DISCORD_WEBHOOK_URL: {
      universalIdentifier: '7056c98a-e7e1-4dba-8a40-b578f30b3479',
      description:
        'Discord incoming webhook URL. When set, a notification is posted to this channel each time the application form creates a new Partner. Leave empty to disable. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: true,
    },
    PARTNER_APP_FRONTEND_URL: {
      universalIdentifier: '746e7bd8-8934-414e-95f5-cc266a624616',
      description:
        'Workspace front-end base URL (e.g. https://partners.twenty.com), used to build the clickable Partner record link in the Discord notification. Set per-workspace in Settings → Apps → Twenty Partners → Variables.',
      isSecret: false,
    },
    SYNC_SHARED_SECRET: {
      universalIdentifier: PARTNERS_SYNC_SHARED_SECRET_VAR_UUID,
      description:
        'Shared HMAC-SHA256 secret for TFT ↔ Partners sync. Must match the value set on the TFT workspace.',
      isSecret: true,
    },
    TFT_ECHO_ENDPOINT: {
      universalIdentifier: TFT_ECHO_ENDPOINT_VAR_UUID,
      description:
        'Full URL of the /partner-echo httpRoute on the TFT workspace.',
      isSecret: false,
    },
    TFT_API_URL: {
      universalIdentifier: TFT_API_URL_VAR_UUID,
      description:
        'Base API URL of the TFT workspace. Example: https://api.twentyfortwenty.twenty.com',
      isSecret: false,
    },
    TFT_API_KEY: {
      universalIdentifier: TFT_API_KEY_VAR_UUID,
      description:
        'API key for the TFT workspace — used by the reconciliation cron to query recent opportunities.',
      isSecret: true,
    },
    PARTNERS_SYNC_SELF_ENDPOINT: {
      universalIdentifier: PARTNERS_SYNC_SELF_ENDPOINT_VAR_UUID,
      description:
        'Full URL of the /tft-sync httpRoute on this (partners) workspace. Used by the reconciliation cron to self-call the upsert path.',
      isSecret: false,
    },
    PARTNERS_PUBLIC_URL: {
      universalIdentifier: PARTNERS_PUBLIC_URL_VAR_UUID,
      description:
        'Public base URL of this partners workspace (e.g. https://partner.twenty.com). Used to build deep links sent back to TFT. Never hardcoded — set per workspace.',
      isSecret: false,
    },
  },
});
