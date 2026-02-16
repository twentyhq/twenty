import { createState } from '@/ui/utilities/state/utils/createState';

export const activeQueryListenersState = createState<
  { queryId: string; operationSignature: Record<string, unknown> }[]
>({
  key: 'activeQueryListenersState',
  defaultValue: [],
});
