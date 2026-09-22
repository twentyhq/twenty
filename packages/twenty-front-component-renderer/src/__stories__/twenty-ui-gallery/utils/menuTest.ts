import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const menuTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Account actions' },
  expectedOpenStatus: null,
  popupText: 'Duplicate',
});
