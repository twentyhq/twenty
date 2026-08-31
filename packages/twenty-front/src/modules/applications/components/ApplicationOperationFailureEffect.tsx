import { useListenToApplicationOperationFailureEvents } from '@/applications/hooks/useListenToApplicationOperationFailureEvents';

export const ApplicationOperationFailureEffect = () => {
  useListenToApplicationOperationFailureEvents();

  return null;
};
