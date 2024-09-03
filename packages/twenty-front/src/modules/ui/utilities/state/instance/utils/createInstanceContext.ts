import { createContext } from 'react';

import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';
import { InstanceStateKey } from '@/ui/utilities/state/instance/types/InstanceStateKey';

export const createInstanceContext = <
  T extends InstanceStateKey = InstanceStateKey,
>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as InstanceStateContext<T>;
};
