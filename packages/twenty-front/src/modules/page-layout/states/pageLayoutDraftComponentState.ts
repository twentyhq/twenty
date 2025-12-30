import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { PageLayoutType } from '~/generated/graphql';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraftComponentState =
  createComponentState<DraftPageLayout>({
    key: 'pageLayoutDraftComponentState',
    defaultValue: {
      id: '',
      name: '',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [],
    },
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
