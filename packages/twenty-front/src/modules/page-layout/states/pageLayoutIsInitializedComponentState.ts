import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutIsInitializedComponentState =
  createComponentState<boolean>({
    key: 'pageLayoutIsInitializedComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
