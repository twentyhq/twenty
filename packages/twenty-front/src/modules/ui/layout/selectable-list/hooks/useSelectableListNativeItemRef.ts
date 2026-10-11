import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SelectableListNativeItemRefsContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListNativeItemRefsContext';

export const useSelectableListNativeItemRef = (itemId: string) => {
  const nativeItemRefs = useContext(SelectableListNativeItemRefsContext);

  if (!isDefined(nativeItemRefs)) {
    throw new Error('SelectableList native item refs are not available');
  }

  return useCallback(
    (element: HTMLElement | null) => {
      if (!isDefined(element)) {
        nativeItemRefs.delete(itemId);
        return;
      }

      nativeItemRefs.set(itemId, element);
    },
    [itemId, nativeItemRefs],
  );
};
