import { useEffect } from 'react';
import { Decorator } from '@storybook/react';

import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';

export const RecordStoreDecorator: Decorator = (Story, context) => {
  const { records } = context.parameters;

  const { setRecords } = useSetRecordInStore();

  useEffect(() => {
    setRecords(records);
  });

  return <Story />;
};
