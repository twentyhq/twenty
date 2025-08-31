import { atom } from 'recoil';
import { type SavedPageLayout } from './savedPageLayoutsState';

export type DraftPageLayout = Omit<
  SavedPageLayout,
  'id' | 'createdAt' | 'updatedAt'
>;

export const pageLayoutDraftState = atom<DraftPageLayout>({
  key: 'pageLayoutDraftState',
  default: {
    name: '',
    type: 'DASHBOARD',
    widgets: [],
  },
});
