import { getFrontComponentColorScheme } from '@/remote/worker/environment/utils/getFrontComponentColorScheme';
import { subscribeToFrontComponentExecutionContextUpdates } from '@/remote/worker/environment/utils/subscribeToFrontComponentExecutionContextUpdates';

export const subscribeToFrontComponentColorSchemeUpdates = (
  listener: () => void,
): (() => void) => {
  let lastNotifiedColorScheme = getFrontComponentColorScheme();

  return subscribeToFrontComponentExecutionContextUpdates(() => {
    const nextColorScheme = getFrontComponentColorScheme();

    if (nextColorScheme === lastNotifiedColorScheme) {
      return;
    }

    lastNotifiedColorScheme = nextColorScheme;
    listener();
  });
};
