import { msg } from '@lingui/core/macro';
import { IconCheck, IconX } from 'twenty-ui/display';

export const BOOLEAN_DATA_MODEL_SELECT_OPTIONS = [
  {
    value: true,
    label: msg`True`,
    Icon: IconCheck,
  },
  {
    value: false,
    label: msg`False`,
    Icon: IconX,
  },
];
