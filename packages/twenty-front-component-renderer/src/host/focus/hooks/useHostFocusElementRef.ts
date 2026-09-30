import { useContext, useLayoutEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { FrontComponentHostFocusControllerContext } from '@/host/focus/contexts/FrontComponentHostFocusControllerContext';

export const useHostFocusElementRef = (
  remoteElementId: string | undefined,
): ElementRefCallback | undefined => {
  const hostFocusController = useContext(
    FrontComponentHostFocusControllerContext,
  );

  useLayoutEffect(() => {
    hostFocusController?.retryPendingFocus();
  });

  return useMemo(() => {
    if (!isDefined(hostFocusController) || !isDefined(remoteElementId)) {
      return undefined;
    }

    let registeredElement: Element | null = null;

    return (element: Element | null) => {
      if (isDefined(registeredElement)) {
        hostFocusController.unregisterElement({
          remoteElementId,
          element: registeredElement,
        });
      }

      registeredElement = element;

      if (isDefined(element)) {
        hostFocusController.registerElement({ remoteElementId, element });
      }
    };
  }, [hostFocusController, remoteElementId]);
};
