import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';
import { type ChipProps } from 'twenty-ui/primitives/data-display';

import { type EventLogRecord } from '~/generated-metadata/graphql';

export type LogConsoleColumn = {
  id: string;
  label: MessageDescriptor;
  gridTrack: string;
  renderCell: (entry: EventLogRecord, color?: ChipProps['color']) => ReactNode;
  align?: 'right';
  hiddenWhenPanelOpen?: boolean;
  hiddenInDetails?: boolean;
};
