import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const logConsoleWebhooksViewState =
  createAtomState<LogConsoleResourceView>({
    key: 'logConsoleWebhooksViewState',
    defaultValue: { type: 'list' },
  });
