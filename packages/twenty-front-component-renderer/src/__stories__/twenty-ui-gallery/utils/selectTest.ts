import { createOverlayOpenTest } from '@/__stories__/twenty-ui-gallery/utils/createOverlayOpenTest';

export const selectTest = createOverlayOpenTest({
  trigger: { role: 'combobox', name: 'Account stage' },
  expectedOpenStatus: null,
  popupText: 'Qualified',
});
