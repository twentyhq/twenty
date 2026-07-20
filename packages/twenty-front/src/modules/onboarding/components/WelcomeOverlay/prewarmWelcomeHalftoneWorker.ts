import WelcomeHalftoneWorker from './welcomeHalftone.worker?worker';

export const prewarmWelcomeHalftoneWorker = (): (() => void) | undefined => {
  const isWelcomeWorkerSupported =
    typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';

  if (!isWelcomeWorkerSupported) {
    return undefined;
  }

  try {
    const welcomeWorker = new WelcomeHalftoneWorker();

    return () => welcomeWorker.terminate();
  } catch {
    return undefined;
  }
};
