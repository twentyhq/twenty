export const SIDE_PANEL_CLOSE_EVENT_NAME = 'side-panel-close';

export const emitSidePanelCloseEvent = () => {
  window.dispatchEvent(new CustomEvent(SIDE_PANEL_CLOSE_EVENT_NAME));
};
