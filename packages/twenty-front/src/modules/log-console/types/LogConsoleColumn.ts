import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';

import { type EventLogRecord } from '~/generated-metadata/graphql';

export type LogConsoleColumn = {
  id: string;
  label: MessageDescriptor;
  gridTrack: string;
  renderCell: (entry: EventLogRecord) => ReactNode;
};
