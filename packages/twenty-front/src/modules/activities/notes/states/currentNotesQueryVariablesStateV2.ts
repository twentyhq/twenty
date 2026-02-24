import { type RecordGqlOperationVariables } from 'twenty-shared/types';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentNotesQueryVariablesStateV2 =
  createState<RecordGqlOperationVariables | null>({
    key: 'currentNotesQueryVariablesStateV2',
    defaultValue: null,
  });
