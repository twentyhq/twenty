import { type MessageDescriptor } from '@lingui/core';

import { type EventLogRecord } from '~/generated-metadata/graphql';

export type LogConsoleIdField = {
  label: MessageDescriptor;
  getId: (entry: EventLogRecord) => string | null | undefined;
};
