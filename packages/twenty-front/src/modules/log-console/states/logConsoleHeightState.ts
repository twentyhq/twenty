import { LOG_CONSOLE_HEIGHT_CONSTRAINTS } from '@/log-console/constants/LogConsoleHeightConstraints';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleHeightState = createAtomState<number>({
  key: 'logConsoleHeightState',
  defaultValue: LOG_CONSOLE_HEIGHT_CONSTRAINTS.default,
  useLocalStorage: true,
});
