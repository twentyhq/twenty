import { atom } from 'recoil';

import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';

export const currentCommentsQueryVariablesState =
  atom<RecordGqlOperationVariables | null>({
    default: null,
    key: 'currentCommentsQueryVariablesState',
  });
