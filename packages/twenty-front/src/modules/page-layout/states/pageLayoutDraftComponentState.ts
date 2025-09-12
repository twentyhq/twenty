import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { PageLayoutType } from '~/generated/graphql';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export type DraftPageLayout = Omit<
  PageLayoutWithData,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export const pageLayoutDraftComponentState =
  createComponentState<DraftPageLayout>({
    key: 'pageLayoutDraftComponentState',
    defaultValue: {
      name: '',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
    },
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
