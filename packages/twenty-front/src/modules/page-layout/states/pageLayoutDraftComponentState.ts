import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PAGE_LAYOUT_DRAFT_COMPONENT_STATE_DEFAULT_VALUE } from '@/page-layout/states/constants/PageLayoutDraftComponentStateDefaultValue';
import { type DraftPageLayout } from '@/page-layout/types/draft-page-layout';
import { PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY } from './constants/PageLayoutDraftComponentStateKey';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';
import { componentLocalStorageEffect } from './effects/componentLocalStorageEffect';

export const pageLayoutDraftComponentState =
  createComponentState<DraftPageLayout>({
    key: PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY,
    defaultValue: PAGE_LAYOUT_DRAFT_COMPONENT_STATE_DEFAULT_VALUE,
    componentInstanceContext: PageLayoutComponentInstanceContext,
    effects: [componentLocalStorageEffect],
  });
