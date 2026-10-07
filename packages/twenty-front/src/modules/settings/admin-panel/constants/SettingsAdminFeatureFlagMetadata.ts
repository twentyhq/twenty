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
  [FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT]: {
    label: msg`Direct REST metadata responses`,
    description: msg`Return metadata directly instead of wrapping it in the legacy response envelope.`,
  },
  [FeatureFlagKey.IS_APPLICATION_WORKFLOWS_ENABLED]: {
    label: msg`Application workflows`,
    description: msg`Allow applications to install workflows and start new workflow runs.`,
  },
  [FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED]: {
    label: msg`Workflow index page`,
    description: msg`Use the dedicated workflow index page to browse workflows and their versions.`,
  },
  [FeatureFlagKey.IS_AI_CHAT_SHARING_DROPDOWN_ENABLED]: {
    label: msg`AI chat sharing dropdown`,
    description: msg`Show the sharing dropdown on AI conversations when record sharing is enabled.`,
  },
  [FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED]: {
    label: msg`Initial object views`,
    description: msg`Use a dedicated initial view for each object in navigation and the view picker.`,
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
    description: msg`Use a dedicated form when creating records.`,
  },
  [FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED]: {
    label: msg`Logs console`,
    description: msg`Show a logs console at the bottom of the app in Advanced mode.`,
  },
  [FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED]: {
    label: msg`Conversations tab`,
    description: msg`Show a Conversations tab listing the AI conversations attached to the record, on record pages of new workspaces.`,
  },
  [FeatureFlagKey.IS_VALIDATION_RULES_ENABLED]: {
    label: msg`Validation rules`,
    description: msg`Let admins add conditions a record must meet to be saved, checked on every write.`,
  },
  [FeatureFlagKey.IS_WORKFLOW_SEND_CHAT_MESSAGE_ENABLED]: {
    label: msg`Workflow inbox messages`,
    description: msg`Add a workflow step that sends a message, and optionally an action to approve, to a member's inbox.`,
  },
  [FeatureFlagKey.IS_CALENDAR_SYNC_SKIP_UNCHANGED_RECORDS_ENABLED]: {
    label: msg`Skip unchanged calendar records`,
    description: msg`Only write calendar events and participants that changed since the last sync.`,
  },
  [FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED]: {
    label: msg`Dashboard filters`,
    description: msg`Show a filter bar above dashboards that filters every chart at once.`,
  },
};
