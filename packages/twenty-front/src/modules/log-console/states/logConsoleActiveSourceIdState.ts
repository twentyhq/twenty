import { LOG_CONSOLE_SOURCES } from '@/log-console/constants/LogConsoleSources';
import { type LogConsoleSourceId } from '@/log-console/types/LogConsoleSourceId';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleActiveSourceIdState =
  createAtomState<LogConsoleSourceId | null>({
    key: 'logConsoleActiveSourceIdState',
    defaultValue: null,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (sourceId) =>
      LOG_CONSOLE_SOURCES.some((source) => source.id === sourceId),
  });
