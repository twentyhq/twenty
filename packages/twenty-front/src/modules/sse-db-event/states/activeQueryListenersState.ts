import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';

export const activeQueryListenersState = createState<
  {
    queryId: string;
    operationSignature:
      | RecordGqlOperationSignature
      | MetadataGqlOperationSignature;
  }[]
>({
  key: 'activeQueryListenersState',
  defaultValue: [],
});
