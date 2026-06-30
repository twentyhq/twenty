import { SIDE_PANEL_CLOSE_EVENT_NAME } from '@/ui/layout/side-panel/utils/emitSidePanelCloseEvent';

const SIDE_PANEL_CLOSE_TIMEOUT_MS = 500;

export const waitForSidePanelClose = (): Promise<void> => {
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, handler);
      clearTimeout(timeoutId);
      resolve();
    };

    const timeoutId = setTimeout(() => {
      window.removeEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, handler);
      resolve();
    }, SIDE_PANEL_CLOSE_TIMEOUT_MS);

    window.addEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, handler);
  });
};
