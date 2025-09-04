import { useState } from 'react';
import { v4 } from 'uuid';

export type KeyValuePair = {
  id: string;
  key: string;
  value: string;
};
export const useKeyValuePairs = (
  defaultValue?: Record<string, string> | Array<string>,
) => {
  const [keyValuePairs, setKeyValuePairs] = useState<KeyValuePair[]>(() => {
    const initialPairs = defaultValue
      ? Object.entries(defaultValue).map(([key, value]) => ({
          id: v4(),
          key,
          value,
        }))
      : [];
    return initialPairs.length > 0
      ? [...initialPairs, { id: v4(), key: '', value: '' }]
      : [{ id: v4(), key: '', value: '' }];
  });

  return { keyValuePairs, setKeyValuePairs };
};
