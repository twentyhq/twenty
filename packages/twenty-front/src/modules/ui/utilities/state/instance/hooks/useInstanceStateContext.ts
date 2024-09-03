import { InstanceStateContext } from '@/ui/utilities/state/instance/types/InstanceStateContext';
import { useContext } from 'react';

export const useInstanceStateContext = <T extends { instanceId: string }>(
  Context: InstanceStateContext<T>,
) => {
  const context = useContext(Context);

  return context;
};
