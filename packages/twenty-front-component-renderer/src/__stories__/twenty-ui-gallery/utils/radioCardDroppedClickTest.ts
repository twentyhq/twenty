import { SANDBOX_ERROR_PATTERNS } from '@/__stories__/twenty-ui-gallery/constants/SANDBOX_ERROR_PATTERNS';
import { createRadioGroupTest } from '@/__stories__/twenty-ui-gallery/utils/createRadioGroupTest';

export const radioCardDroppedClickTest = createRadioGroupTest({
  optionName: 'Pro plan',
  activationErrors: {
    requiredErrors: [SANDBOX_ERROR_PATTERNS.COMPOSED_PATH],
  },
});
