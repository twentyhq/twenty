import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutIsInitializedComponentState =
  createComponentStateV2<boolean>({
    key: 'pageLayoutIsInitializedComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
