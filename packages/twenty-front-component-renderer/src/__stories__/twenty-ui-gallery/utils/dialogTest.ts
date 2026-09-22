import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const dialogTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Edit account' },
  expectedOpenStatus: 'Dialog: open',
  popupText: 'Update the account details.',
});
