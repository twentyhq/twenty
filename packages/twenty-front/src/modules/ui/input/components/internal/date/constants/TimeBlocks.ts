import { IMask } from 'react-imask';

export const TIME_BLOCKS = {
  HH: {
    mask: IMask.MaskedRange, // Use MaskedRange for valid hour range (0-23)
    from: 0,
    to: 23,
  },
  mm: {
    mask: IMask.MaskedRange, // Use MaskedRange for valid minute range (0-59)
    from: 0,
    to: 59,
  },
};
