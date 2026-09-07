import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCalendarEventComposerCreatingState = createAtomState<boolean>({
  key: 'activities/calendar/isCalendarEventComposerCreatingState',
  defaultValue: false,
});
