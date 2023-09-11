import { atom } from 'recoil';

export const viewEditModeState = atom<{
  mode: 'create' | 'edit' | undefined;
  viewId: string | undefined;
}>({
  key: 'viewEditModeState',
  default: { mode: undefined, viewId: undefined },
});
