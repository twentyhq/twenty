import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleTimeZoneState = createAtomState<'member' | 'utc'>({
  key: 'logConsoleTimeZoneState',
  defaultValue: 'member',
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
  validateInitFn: (timeZone) => timeZone === 'member' || timeZone === 'utc',
});
