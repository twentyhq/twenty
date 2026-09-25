import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { FeatureFlagKey } from '~/generated-admin/graphql';

// Public flags use server-provided client config metadata to stay consistent with the lab.
export const SETTINGS_ADMIN_FEATURE_FLAG_METADATA: Partial<
  Record<
    FeatureFlagKey,
    { label: MessageDescriptor; description: MessageDescriptor }
  >
> = {
  [FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED]: {
    label: msg`Async CSV export`,
    description: msg`Generate CSV exports in the background with progress and automatic downloads.`,
  },
  [FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED]: {
    label: msg`Unique indexes`,
    description: msg`Allow unique indexes to prevent duplicate field values.`,
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
  [FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT]: {
    label: msg`Direct REST metadata responses`,
    description: msg`Return metadata directly instead of wrapping it in the legacy response envelope.`,
  },
  [FeatureFlagKey.IS_LOGIC_FUNCTION_PREBUILT_MODE_ENABLED]: {
    label: msg`Prebuilt logic functions`,
    description: msg`Run logic functions from prebuilt application bundles.`,
  },
  [FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED]: {
    label: msg`Workflow index page`,
    description: msg`Use the dedicated workflow index page to browse workflows and their versions.`,
  },
  [FeatureFlagKey.IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED]: {
    label: msg`Message and calendar target reads`,
    description: msg`Use target relations to find messages and calendar events linked to records.`,
  },
  [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: {
    label: msg`Record sharing`,
    description: msg`Allow sharing individual records with workspace members.`,
  },
  [FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED]: {
    label: msg`AI chat sharing dropdown`,
    description: msg`Show the sharing dropdown on AI conversations when record sharing is enabled.`,
  },
  [FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED]: {
    label: msg`Webhook rate limits`,
    description: msg`Limit the rate of outgoing webhook deliveries.`,
  },
  [FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED]: {
    label: msg`Deferred workspace migration actions`,
    description: msg`Run the slow parts of data model changes in the background after they are saved.`,
  },
  [FeatureFlagKey.IS_EXECUTION_QUOTA_ENABLED]: {
    label: msg`Execution quotas`,
    description: msg`Enforce usage quotas on workflow node runs and logic function executions.`,
  },
  [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED]: {
    label: msg`Record creation form`,
    description: msg`Use a dedicated form when creating records.`,
  },
  [FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED]: {
    label: msg`Logs console`,
    description: msg`Show a logs console at the bottom of the app in Advanced mode.`,
  },
};
