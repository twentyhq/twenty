import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { PageLayoutType } from '~/generated-metadata/graphql';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraftComponentState =
  createAtomComponentState<DraftPageLayout>({
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
