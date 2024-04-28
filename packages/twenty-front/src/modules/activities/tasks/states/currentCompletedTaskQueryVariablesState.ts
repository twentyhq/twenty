import { atom } from 'recoil';

import { RecordGqlOperationVariables } from '@/object-record/graphql-operations/types/RecordGqlOperationVariables';

export const currentCompletedTaskQueryVariablesState =
  atom<RecordGqlOperationVariables | null>({
    default: null,
    key: 'currentCompletedTaskQueryVariablesState',
  });
