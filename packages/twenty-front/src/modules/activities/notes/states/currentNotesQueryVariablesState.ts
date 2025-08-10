import { atom } from 'recoil';

import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export const currentNotesQueryVariablesState =
  atom<RecordGqlOperationVariables | null>({
    default: null,
    key: 'currentNotesQueryVariablesState',
  });
