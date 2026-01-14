import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { createState } from 'twenty-ui/utilities';

export const requiredQueryListenersState = createState<
  { queryId: string; operationSignature: RecordGqlOperationSignature }[]
>({
  key: 'requiredQueryListenersState',
  defaultValue: [],
});
