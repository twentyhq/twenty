import { RADIO_ACTIVATION_ERRORS } from '@/__stories__/twenty-ui-gallery/constants/RadioActivationErrors';
import { createRadioGroupTest } from '@/__stories__/twenty-ui-gallery/utils/createRadioGroupTest';

export const cardPickerTest = createRadioGroupTest({
  optionName: 'Pro plan',
  activationErrors: RADIO_ACTIVATION_ERRORS,
});
