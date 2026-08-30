import { useAtomValue } from 'jotai';

import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';

// Reads the path of a stack entry other than the one being rendered, so the top
// bar can describe an entry without mounting it.
export const useSidePanelRoutedPagePathByPageId = (pageId: string) =>
  useAtomValue(
    sidePanelRoutedPagePathComponentState.atomFamily({ instanceId: pageId }),
  );
