import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutTabListCurrentDragDroppableIdComponentState =
  createComponentStateV2<string | undefined>({
    key: 'pageLayoutTabListCurrentDragDroppableIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
