import { type RecordGqlOperationVariables } from 'twenty-shared/types';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentNotesQueryVariablesState =
  createAtomState<RecordGqlOperationVariables | null>({
    key: 'currentNotesQueryVariablesState',
    defaultValue: null,
  });
