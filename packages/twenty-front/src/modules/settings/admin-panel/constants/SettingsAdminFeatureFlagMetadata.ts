import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { FeatureFlagKey } from '~/generated-admin/graphql';

// Public flags use server-provided client config metadata to stay consistent with the lab.
export const SETTINGS_ADMIN_FEATURE_FLAG_METADATA: Record<
  FeatureFlagKey,
  { label: MessageDescriptor; description: MessageDescriptor }
> = {
  [FeatureFlagKey.IS_CONFIGURABLE_SEARCH_FIELDS_ENABLED]: {
    label: msg`Configurable search fields`,
    description: msg`Choose which fields are used when searching for records.`,
  },
  [FeatureFlagKey.IS_REST_METADATA_API_NEW_FORMAT_DIRECT]: {
    label: msg`Direct REST metadata responses`,
    description: msg`Return metadata directly instead of wrapping it in the legacy response envelope.`,
  },
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: {
    label: msg`Record sharing`,
    description: msg`Let people restrict and share individual records.`,
  },
  [FeatureFlagKey.IS_CALENDAR_INTERNAL_EVENTS_FILTER_ENABLED]: {
    label: msg`Skip internal meetings`,
    description: msg`Skip calendar events with no participant outside the workspace domain, unless internal import is turned on.`,
  },
  [FeatureFlagKey.IS_INTERNAL_IMPORT_COLUMN_ENABLED]: {
    label: msg`Internal import setting column`,
    description: msg`Read the internal import setting from its new workspace column. Turned on by the 2.59 upgrade.`,
  },
  [FeatureFlagKey.IS_CALENDAR_RECURRING_EVENT_HORIZON_ENABLED]: {
    label: msg`Import recurring meetings 90 days ahead`,
    description: msg`Import occurrences of recurring Google Calendar meetings up to 90 days ahead only, and import later occurrences as they come within 90 days.`,
  },
  [FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED]: {
    label: msg`Customizable sidebar`,
    description: msg`Organize the sidebar in tabs and sections, including built-in sections for favorites, chats and agents, and customize it in place.`,
  },
  [FeatureFlagKey.IS_AI_CHAT_COMPONENT_BUILDER_ENABLED]: {
    label: msg`AI chat component builder`,
    description: msg`Create and preview frontend components in AI chat before adding them to the Workspace app.`,
  },
  [FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED]: {
    label: msg`AI chat inbox`,
    description: msg`Turn the AI tab into an inbox to triage, assign, snooze and follow chats, let workflows send messages and agent questions to a member's inbox, and show a Conversations tab on record pages.`,
  },
  [FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED]: {
    label: msg`Direct message pair identity`,
    description: msg`Reuse the same conversation when the same two workspace members start a direct message. Enabled after the workspace upgrade completes.`,
  },
  [FeatureFlagKey.IS_MCP_SERVERS_ENABLED]: {
    label: msg`MCP servers`,
    description: msg`Register external MCP servers in Developers settings and expose their tools to AI chat.`,
  },
  // TODO(@charlesBochet): remove the API key channel visibility exemption after 2026-11-30
  [FeatureFlagKey.IS_CHANNEL_VISIBILITY_ENFORCED_ON_API_KEYS]: {
    label: msg`Channel visibility on API keys`,
    description: msg`Remove the message and calendar access of API keys on roles assignable to users. While off, those API keys read them as a member who doesn't own the channel would.`,
  },
  [FeatureFlagKey.IS_GETTING_STARTED_ENABLED]: {
    label: msg`Getting started`,
    description: msg`Show the Getting started page and sidebar card, and open it on landing during the trial.`,
  },
  [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: {
    label: msg`Private records`,
    description: msg`Apply private records on objects that aren't private by default. Always on for workspaces that have set record sharing. Turning this off makes records set as private on those objects visible again.`,
  },
  [FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED]: {
    label: msg`AI data policy and Privacy tab`,
    description: msg`Show the Privacy tab and enforce its AI data policy and data sharing settings. Turning this off lifts any stored policy. Enable after the instance upgrade completes.`,
  },
  [FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED]: {
    label: msg`Group tabs`,
    description: msg`Let grouped table and list views show their groups as tabs, one group at a time. Enable after the instance upgrade completes.`,
  },
  [FeatureFlagKey.IS_FORMULA_FIELD_ENABLED]: {
    label: msg`Formula fields`,
    description: msg`Let text, number, boolean and date fields compute their value from an expression over the record and its related records.`,
  },
  [FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED]: {
    label: msg`Lookup columns`,
    description: msg`Add table columns that show a field of a related record, such as a person's company industry. Enable after the instance upgrade completes.`,
  },
  [FeatureFlagKey.IS_WIDGET_CONDITIONAL_AVAILABILITY_ENABLED]: {
    label: msg`Widget visibility rule tree`,
    description: msg`Read the visibility rule of page layout widgets from its tree form only. Enabled after the workspace upgrade copies the stored rules.`,
  },
  [FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]: {
    label: msg`Inbox object names`,
    description: msg`Use the inbox names for the chat thread and message objects. Turned on by the workspace upgrade that renames them, so don't toggle it by hand.`,
  },
};
