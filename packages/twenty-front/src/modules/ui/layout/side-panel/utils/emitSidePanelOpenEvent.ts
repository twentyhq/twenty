export const SIDE_PANEL_OPEN_EVENT_NAME = 'side-panel-open';

export const emitSidePanelOpenEvent = () => {
  window.dispatchEvent(new CustomEvent(SIDE_PANEL_OPEN_EVENT_NAME));
};
