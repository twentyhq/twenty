import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleApiKeysViewState =
  createAtomState<LogConsoleResourceView>({
    key: 'logConsoleApiKeysViewState',
    defaultValue: { type: 'list' },
  });
