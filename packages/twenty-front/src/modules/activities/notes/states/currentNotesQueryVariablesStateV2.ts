import { type RecordGqlOperationVariables } from 'twenty-shared/types';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentNotesQueryVariablesStateV2 =
  createStateV2<RecordGqlOperationVariables | null>({
    key: 'currentNotesQueryVariablesStateV2',
    defaultValue: null,
  });
