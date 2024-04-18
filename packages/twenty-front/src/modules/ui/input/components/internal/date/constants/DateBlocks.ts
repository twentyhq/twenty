import { IMask } from 'react-imask';

import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';

export const DATE_BLOCKS = {
  YYYY: {
    mask: IMask.MaskedRange,
    from: MIN_DATE.getFullYear(),
    to: MAX_DATE.getFullYear(),
  },
  MM: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 12,
  },
  DD: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 31,
  },
};
