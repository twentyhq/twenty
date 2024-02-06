import { atom } from 'recoil';

export const isWorkspaceSchemaCreatedState = atom<boolean | null>({
  key: 'isWorkspaceSchemaCreatedState',
  default: null,
});
