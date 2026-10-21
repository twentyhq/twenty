import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type EventLogRecord } from '~/generated-metadata/graphql';

export type LogConsoleIdField = {
  label: MessageDescriptor;
  Icon?: IconComponent;
  getId: (entry: EventLogRecord) => string | null | undefined;
};
