import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { createState } from '@/ui/utilities/state/utils/createState';

export const activeQueryListenersState = createState<
  { queryId: string; operationSignature: RecordGqlOperationSignature }[]
>({
  key: 'activeQueryListenersState',
  defaultValue: [],
});
