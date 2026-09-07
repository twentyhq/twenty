import { type QueryListener } from '@/sse-db-event/types/QueryListener';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastRegisteredQueryListenersState = createAtomState<
  QueryListener[]
>({
  key: 'lastRegisteredQueryListenersState',
  defaultValue: [],
});
