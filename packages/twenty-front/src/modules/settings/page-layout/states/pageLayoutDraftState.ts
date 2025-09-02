import { createState } from 'twenty-ui/utilities';
import { PageLayoutType, type SavedPageLayout } from './savedPageLayoutsState';

export type DraftPageLayout = Omit<
  SavedPageLayout,
  'id' | 'createdAt' | 'updatedAt'
>;

export const pageLayoutDraftState = createState<DraftPageLayout>({
  key: 'pageLayoutDraftState',
  defaultValue: {
    name: '',
    type: PageLayoutType.DASHBOARD,
    widgets: [],
  },
});
