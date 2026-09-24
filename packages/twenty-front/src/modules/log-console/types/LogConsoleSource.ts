import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { type EventLogTable } from '~/generated-metadata/graphql';

export type LogConsoleSource = {
  id: LogConsoleSourceId;
  label: MessageDescriptor;
  Icon: IconComponent;
  table: EventLogTable;
  requiresAuditLogs: boolean;
};
