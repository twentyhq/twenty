import { atom } from 'recoil';

import { type RecordGqlOperationVariables } from 'twenty-shared/types';

export const currentNotesQueryVariablesState =
  atom<RecordGqlOperationVariables | null>({
    default: null,
    key: 'currentNotesQueryVariablesState',
  });
