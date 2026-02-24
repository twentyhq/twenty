import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutTabListCurrentDragDroppableIdComponentState =
  createComponentState<string | undefined>({
    key: 'pageLayoutTabListCurrentDragDroppableIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
