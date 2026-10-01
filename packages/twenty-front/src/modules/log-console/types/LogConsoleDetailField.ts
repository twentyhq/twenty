import { type MessageDescriptor } from '@lingui/core';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export type LogConsoleDetailField = {
  label: MessageDescriptor;
  Icon: IconComponent;
  renderValue: (
    entry: EventLogRecord,
    context: {
      formattedTimestamp: string;
      objectMetadataItem?: EnrichedObjectMetadataItem;
    },
  ) => ReactNode;
};
