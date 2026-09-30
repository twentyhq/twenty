import { useContext, useLayoutEffect } from 'react';

import { FrontComponentHostFocusControllerContext } from '@/host/focus/contexts/FrontComponentHostFocusControllerContext';

export const useRetryPendingHostFocus = (): void => {
  const hostFocusController = useContext(
    FrontComponentHostFocusControllerContext,
  );

  useLayoutEffect(() => {
    hostFocusController?.retryPendingFocus();
  });
};
