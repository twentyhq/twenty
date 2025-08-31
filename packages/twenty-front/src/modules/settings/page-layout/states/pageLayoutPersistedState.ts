import { atom } from 'recoil';
import { type SavedPageLayout } from './savedPageLayoutsState';

export const pageLayoutPersistedState = atom<SavedPageLayout | undefined>({
  key: 'pageLayoutPersistedState',
  default: undefined,
});
