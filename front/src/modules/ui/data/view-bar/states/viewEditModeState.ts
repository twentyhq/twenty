import { atom } from 'recoil';

export const viewEditModeState = atom<{
  mode: 'create' | 'edit';
  viewId: string | undefined;
}>({
  key: 'viewEditModeState',
  default: { mode: 'edit', viewId: undefined },
});
