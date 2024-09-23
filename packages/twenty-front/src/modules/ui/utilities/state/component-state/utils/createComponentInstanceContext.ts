import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { ComponentStateKeyV2 } from '@/ui/utilities/state/component-state/types/ComponentStateKeyV2';
import { createContext } from 'react';

export const createComponentInstanceContext = <
  T extends ComponentStateKeyV2 = ComponentStateKeyV2,
>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ComponentInstanceStateContext<T>;
};
