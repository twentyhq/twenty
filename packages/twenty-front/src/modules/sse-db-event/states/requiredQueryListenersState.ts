import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import {
  type MetadataGqlOperationSignature,
  type RecordGqlOperationSignature,
} from 'twenty-shared/types';

export const requiredQueryListenersState = createStateV2<
  {
    queryId: string;
    operationSignature:
      | RecordGqlOperationSignature
      | MetadataGqlOperationSignature;
  }[]
>({
  key: 'requiredQueryListenersState',
  defaultValue: [],
});
