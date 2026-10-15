import { LOG_CONSOLE_APP_ANALYTICS_SCOPES } from '@/log-console/constants/LogConsoleAppAnalyticsScopes';
import { type LogConsoleAppAnalyticsScope } from '@/log-console/types/LogConsoleAppAnalyticsScope';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleAppAnalyticsScopeState =
  createAtomState<LogConsoleAppAnalyticsScope>({
    key: 'logConsoleAppAnalyticsScopeState',
    defaultValue: 'current-workspace',
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (scope) => LOG_CONSOLE_APP_ANALYTICS_SCOPES.includes(scope),
  });
