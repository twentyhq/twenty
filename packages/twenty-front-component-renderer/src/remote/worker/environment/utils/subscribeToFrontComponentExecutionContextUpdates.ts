import { getFrontComponentExecutionContextListeners } from '@/remote/worker/environment/utils/getFrontComponentExecutionContextListeners';

export const subscribeToFrontComponentExecutionContextUpdates = (
  listener: () => void,
): (() => void) => {
  const executionContextListeners =
    getFrontComponentExecutionContextListeners();

  executionContextListeners.add(listener);

  return () => {
    executionContextListeners.delete(listener);
  };
};
