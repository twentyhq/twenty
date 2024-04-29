import { atom } from 'recoil';

import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export const currentIncompleteTaskQueryVariablesState =
  atom<RecordGqlOperationVariables | null>({
    default: null,
    key: 'currentIncompleteTaskQueryVariablesState',
  });
