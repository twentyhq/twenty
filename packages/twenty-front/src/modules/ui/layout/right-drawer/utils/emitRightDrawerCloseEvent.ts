export const RIGHT_DRAWER_CLOSE_EVENT_NAME = 'right-drawer-close';

export const emitRightDrawerCloseEvent = () => {
  window.dispatchEvent(new CustomEvent(RIGHT_DRAWER_CLOSE_EVENT_NAME));
};
