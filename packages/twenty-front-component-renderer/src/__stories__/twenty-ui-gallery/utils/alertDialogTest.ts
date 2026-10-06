import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const alertDialogTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Delete account' },
  expectedOpenStatus: 'Confirmation: open',
  popupText: 'This action cannot be undone',
});
