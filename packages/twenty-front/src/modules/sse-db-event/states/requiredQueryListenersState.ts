import { createState } from '@/ui/utilities/state/utils/createState';

export const requiredQueryListenersState = createState<
  { queryId: string; operationSignature: Record<string, unknown> }[]
>({
  key: 'requiredQueryListenersState',
  defaultValue: [],
});
