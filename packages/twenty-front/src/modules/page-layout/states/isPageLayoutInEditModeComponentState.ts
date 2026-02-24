import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const isPageLayoutInEditModeComponentState =
  createComponentState<boolean>({
    key: 'isPageLayoutInEditModeComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
