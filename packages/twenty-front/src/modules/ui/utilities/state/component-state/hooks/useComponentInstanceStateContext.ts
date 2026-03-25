import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { useContext } from 'react';

export const useComponentInstanceStateContext = <
  T extends { instanceId: string },
>(
  Context: ComponentInstanceStateContext<T>,
) => {
  const context = useContext(Context);

  return context;
};
