import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type SettingsLogsSourceId } from '@/settings/log-explorer/types/SettingsLogsSourceId';
import { type EventLogTable } from '~/generated-metadata/graphql';

export type SettingsLogsSource = {
  id: SettingsLogsSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  table: EventLogTable;
  requiresAuditLogs: boolean;
};
