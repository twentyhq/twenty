import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { useContext } from 'react';

export const useComponentInstanceStateContext = <T extends ComponentStateKey>(
  Context: ComponentInstanceStateContext<T>,
) => {
  const context = useContext(Context);

  return context;
};
