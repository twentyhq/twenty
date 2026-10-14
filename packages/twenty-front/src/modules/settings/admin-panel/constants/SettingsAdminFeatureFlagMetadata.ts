import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { FeatureFlagKey } from '~/generated-admin/graphql';

// Public flags use server-provided client config metadata to stay consistent with the lab.
export const SETTINGS_ADMIN_FEATURE_FLAG_METADATA: Record<
  FeatureFlagKey,
  { label: MessageDescriptor; description: MessageDescriptor }
> = {
  [FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED]: {
    label: msg`Async CSV export`,
    description: msg`Generate CSV exports in the background with progress and automatic downloads.`,
  },
  [FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED]: {
    label: msg`Configurable search fields`,
    description: msg`Choose which fields are used when searching for records.`,
  },
  [FeatureFlagKey.IS_JSON_FILTER_ENABLED]: {
    label: msg`JSON filters`,
    description: msg`Allow filtering records by values inside JSON fields.`,
  },
  [FeatureFlagKey.IS_MESSAGE_CAMPAIGN_ENABLED]: {
    label: msg`Email campaigns`,
    description: msg`Enable email campaigns, lists, and unsubscribe management.`,
  },
  [FeatureFlagKey.IS_MORPH_RELATION_HEAD_ENABLED]: {
    label: msg`Morph relation heads`,
    description: msg`Expose each relation to several objects as one field with a stable id.`,
  },
  [FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT]: {
    label: msg`Direct REST metadata responses`,
    description: msg`Return metadata directly instead of wrapping it in the legacy response envelope.`,
  },
  [FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED]: {
    label: msg`Application workflows`,
    description: msg`Allow applications to install workflows and start new workflow runs.`,
  },
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: {
    label: msg`Record sharing`,
    description: msg`Let people restrict and share individual records.`,
  },
  [FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED]: {
    label: msg`Record sharing visibility`,
    description: msg`Apply record sharing visibility rules when accessing records.`,
  },
  [FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED]: {
    label: msg`Deferred workspace migration actions`,
    description: msg`Run the slow parts of data model changes in the background after they are saved.`,
  },
  [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED]: {
    label: msg`Record creation form`,
    description: msg`Use a dedicated form when creating records, and enable validation rules.`,
  },
  [FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED]: {
    label: msg`Logs console`,
    description: msg`Show a logs console at the bottom of the app in Advanced mode.`,
  },
  [FeatureFlagKey.IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED]: {
    label: msg`Skip unchanged calendar records`,
    description: msg`Only write calendar events and participants that changed since the last sync.`,
  },
  [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: {
    label: msg`AI chat inbox`,
    description: msg`Turn the AI tab into an inbox to triage, assign, snooze and follow chats, let workflows send messages and agent questions to a member's inbox, and show a Conversations tab on record pages.`,
  },
  [FeatureFlagKey.IS_APP_PREFERENCES_ENABLED]: {
    label: msg`App preferences`,
    description: msg`Replace the Accounts settings with App preferences, built around accounts and the apps that use them.`,
  },
};
