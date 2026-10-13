import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleAppAnalyticsRegistrationIdState = createAtomState<
  string | null
>({
  key: 'logConsoleAppAnalyticsRegistrationIdState',
  defaultValue: null,
});
