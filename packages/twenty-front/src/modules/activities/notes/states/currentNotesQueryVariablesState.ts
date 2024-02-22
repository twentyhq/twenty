import { atom } from 'recoil';

import { ObjectRecordQueryVariables } from '@/object-record/types/ObjectRecordQueryVariables';

export const currentNotesQueryVariablesState =
  atom<ObjectRecordQueryVariables | null>({
    default: null,
    key: 'currentNotesQueryVariablesState',
  });
