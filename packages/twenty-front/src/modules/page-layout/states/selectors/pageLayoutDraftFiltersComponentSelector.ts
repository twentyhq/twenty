import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

import { PageLayoutComponentInstanceContext } from '../contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraftFiltersComponentSelector =
  createAtomComponentSelector<DraftPageLayout['filters']>({
    key: 'pageLayoutDraftFiltersComponentSelector',
    componentInstanceContext: PageLayoutComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        get(pageLayoutDraftComponentState, { instanceId }).filters,
  });
