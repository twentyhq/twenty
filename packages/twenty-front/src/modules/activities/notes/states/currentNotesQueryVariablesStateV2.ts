import { type RecordGqlOperationVariables } from 'twenty-shared/types';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentNotesQueryVariablesStateV2 =
  createAtomState<RecordGqlOperationVariables | null>({
    key: 'currentNotesQueryVariablesStateV2',
    defaultValue: null,
  });
