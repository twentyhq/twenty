import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { createState } from 'twenty-ui/utilities';

export const activeQueryListenersState = createState<
  { queryId: string; operationSignature: RecordGqlOperationSignature }[]
>({
  key: 'activeQueryListenersState',
  defaultValue: [],
});
