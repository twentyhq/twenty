import { isArray } from '@sniptt/guards';
import { useContext, useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentHostScrollControllerContext } from '@/host/scroll/contexts/FrontComponentHostScrollControllerContext';

export const useHostScrollCommands = ({
  remoteElementId,
  scrollCommands,
  onScrollUpdate,
}: {
  remoteElementId: string | undefined;
  scrollCommands: unknown;
  onScrollUpdate: unknown;
}): void => {
  const hostScrollController = useContext(
    FrontComponentHostScrollControllerContext,
  );

  useLayoutEffect(() => {
    if (
      !isDefined(hostScrollController) ||
      !isDefined(remoteElementId) ||
      !isArray(scrollCommands)
    ) {
      return;
    }

    hostScrollController.enqueueScrollCommands({
      remoteElementId,
      scrollCommands,
      onScrollUpdate,
    });
  }, [hostScrollController, remoteElementId, scrollCommands, onScrollUpdate]);
};
