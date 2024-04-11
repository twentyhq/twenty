import { IMask } from 'react-imask';

import { TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/TimeBlocks';

export const DATE_TIME_BLOCKS = {
  YYYY: {
    mask: IMask.MaskedRange,
    from: 1970,
    to: 2100,
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
  ...TIME_BLOCKS,
};
