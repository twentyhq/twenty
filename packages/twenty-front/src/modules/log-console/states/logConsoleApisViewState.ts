import { type LogConsoleApisView } from '@/log-console/types/LogConsoleApisView';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleApisViewState = createAtomState<LogConsoleApisView>({
  key: 'logConsoleApisViewState',
  defaultValue: { type: 'list' },
});
