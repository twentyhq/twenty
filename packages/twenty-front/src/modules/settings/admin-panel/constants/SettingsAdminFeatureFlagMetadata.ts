import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { FeatureFlagKey } from '~/generated-admin/graphql';

export const SETTINGS_ADMIN_FEATURE_FLAG_METADATA: Record<
  FeatureFlagKey,
  { label: MessageDescriptor; description: MessageDescriptor }
> = {
  [FeatureFlagKey.IS_APP_CLAIMING_ENABLED]: {
    label: msg`App claiming`,
    description: msg`Allow developers to claim ownership of applications.`,
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
  [FeatureFlagKey.IS_EMAIL_GROUP_ENABLED]: {
    label: msg`Email campaigns`,
    description: msg`Enable email campaigns and sending domain management.`,
  },
  [FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED]: {
    label: msg`Junction relations`,
    description: msg`Allow many-to-many relationships between records using junction objects.`,
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
  [FeatureFlagKey.IS_API_RATE_LIMIT_V2_ENABLED]: {
    label: msg`API rate limits v2`,
    description: msg`Use the usage limit engine to enforce API request speed limits.`,
  },
  [FeatureFlagKey.IS_MESSAGE_CALENDAR_TARGET_READ_ENABLED]: {
    label: msg`Message and calendar target reads`,
    description: msg`Use target relations to find messages and calendar events linked to records.`,
  },
  [FeatureFlagKey.IS_QUOTA_ENGINE_CREDIT_BOUND_ENABLED]: {
    label: msg`Credit allowance quotas`,
    description: msg`Use the quota engine to enforce credit allowances.`,
  },
  [FeatureFlagKey.IS_RECORD_CREATION_FORM_ENABLED]: {
    label: msg`Record creation form`,
    description: msg`Use a dedicated form when creating records.`,
  },
  [FeatureFlagKey.IS_RECORD_SHARING_ENABLED]: {
    label: msg`Record sharing`,
    description: msg`Allow sharing individual records with workspace members.`,
  },
  [FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED]: {
    label: msg`Webhook rate limits`,
    description: msg`Limit the rate of outgoing webhook deliveries.`,
  },
};
