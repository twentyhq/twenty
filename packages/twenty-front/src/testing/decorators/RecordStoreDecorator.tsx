import { type Decorator } from '@storybook/react';
import { useEffect } from 'react';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const RecordStoreDecorator: Decorator = (Story, context) => {
  const { records } = context.parameters;

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: records });
  });

  return <Story />;
};
