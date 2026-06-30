import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutTabListCurrentDragDroppableIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'pageLayoutTabListCurrentDragDroppableIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
