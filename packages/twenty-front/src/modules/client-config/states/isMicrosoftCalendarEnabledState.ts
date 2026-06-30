import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isMicrosoftCalendarEnabledState = createAtomState<boolean>({
  key: 'isMicrosoftCalendarEnabled',
  defaultValue: false,
});
