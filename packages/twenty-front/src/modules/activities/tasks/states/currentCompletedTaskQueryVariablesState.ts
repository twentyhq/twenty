import { atom } from 'recoil';

import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const currentCompletedTaskQueryVariablesState =
  atom<ObjectRecordQueryVariables | null>({
    default: null,
    key: 'currentCompletedTaskQueryVariablesState',
  });
