import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleTimeZoneState = createAtomState<'member' | 'utc'>({
  key: 'logConsoleTimeZoneState',
  defaultValue: 'member',
});
