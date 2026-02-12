import { type RecordGqlOperationSignature } from 'twenty-shared/types';
import { createState } from '@/ui/utilities/state/utils/createState';

export const requiredQueryListenersState = createState<
  { queryId: string; operationSignature: RecordGqlOperationSignature }[]
>({
  key: 'requiredQueryListenersState',
  defaultValue: [],
});
