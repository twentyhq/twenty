import { useListenToApplicationEvents } from '@/applications/hooks/useListenToApplicationEvents';

export const ApplicationSSEEffect = () => {
  useListenToApplicationEvents();

  return null;
};
