import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

import { type BookCallSlot } from '@/getting-started/types/BookCallSlot';

export const gettingStartedBookCallSlotsByDayState = createAtomState<Record<
  string,
  BookCallSlot[]
> | null>({
  key: 'gettingStartedBookCallSlotsByDayState',
  defaultValue: null,
});
