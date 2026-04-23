import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createContext } from 'react';

export const createComponentInstanceContext = <
  T extends ComponentStateKey = ComponentStateKey,
>(
  initialValue?: T,
) => {
  return createContext<T | null>(
    initialValue ?? null,
  ) as ComponentInstanceStateContext<T>;
};
