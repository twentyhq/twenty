import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutTabListCurrentDragDroppableIdComponentState =
  createComponentState<string | undefined>({
    key: 'pageLayoutTabListCurrentDragDroppableIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
