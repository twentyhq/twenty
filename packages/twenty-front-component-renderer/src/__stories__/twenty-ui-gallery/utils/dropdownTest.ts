import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const dropdownTest = createOverlayOpenTest({
  trigger: { role: 'button', name: 'Choose assignee' },
  expectedOpenStatus: null,
  popupText: 'Assign person',
});
