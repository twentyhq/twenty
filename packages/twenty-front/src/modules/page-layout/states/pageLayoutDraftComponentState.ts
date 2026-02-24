import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { PageLayoutType } from '~/generated-metadata/graphql';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraftComponentState =
  createComponentStateV2<DraftPageLayout>({
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
