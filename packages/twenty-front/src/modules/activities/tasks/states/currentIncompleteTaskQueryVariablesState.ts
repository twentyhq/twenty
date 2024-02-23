import { atom } from 'recoil';

import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const currentIncompleteTaskQueryVariablesState =
  atom<ObjectRecordQueryVariables | null>({
    default: null,
    key: 'currentIncompleteTaskQueryVariablesState',
  });
