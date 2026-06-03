export const SIDE_PANEL_CLOSE_EVENT_NAME = 'side-panel-close';

export const emitSidePanelCloseEvent = () => {
  window.dispatchEvent(new CustomEvent(SIDE_PANEL_CLOSE_EVENT_NAME));
};

export const waitForSidePanelClose = (): Promise<void> => {
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, handler);
      resolve();
    };

    window.addEventListener(SIDE_PANEL_CLOSE_EVENT_NAME, handler);
  });
};
