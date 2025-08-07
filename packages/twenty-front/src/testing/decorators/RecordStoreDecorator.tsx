import { useEffect } from 'react';
import { type Decorator } from '@storybook/react';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';

export const RecordStoreDecorator: Decorator = (Story, context) => {
  const { records } = context.parameters;

  const { upsertRecords } = useUpsertRecordsInStore();

  useEffect(() => {
    upsertRecords(records);
  });

  return <Story />;
};
