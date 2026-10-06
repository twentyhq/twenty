import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const popoverTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Account details' },
  expectedOpenStatus: 'Details: open',
  popupText: 'Alice manages this account',
});
