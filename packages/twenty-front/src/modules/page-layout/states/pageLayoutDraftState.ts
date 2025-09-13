import { createState } from 'twenty-ui/utilities';
import { PageLayoutType } from '~/generated/graphql';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

export type DraftPageLayout = Omit<
  PageLayoutWithData,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export const pageLayoutDraftState = createState<DraftPageLayout>({
  key: 'pageLayoutDraftState',
  defaultValue: {
    name: '',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    tabs: [],
  },
});
