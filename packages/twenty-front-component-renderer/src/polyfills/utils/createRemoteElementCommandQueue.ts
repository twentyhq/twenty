import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { isElementNode } from '@/polyfills/dom/utils/isElementNode';
import { type RemoteElementCommand } from '@/types/RemoteElementCommand';

export const createRemoteElementCommandQueue = <TRequest>({
  bridgeProperty,
  maxPendingCommands = Number.POSITIVE_INFINITY,
  readAcknowledgedNativeEditSequence,
}: {
  bridgeProperty: string;
  maxPendingCommands?: number;
  readAcknowledgedNativeEditSequence?: (element: object) => number | undefined;
}) => {
  const pendingCommandsByElement = new WeakMap<
    object,
    RemoteElementCommand<TRequest>[]
  >();

  let lastCommandSequence = 0;

  const sendPendingCommandsToHost = ({
    element,
    commands,
  }: {
    element: object;
    commands: RemoteElementCommand<TRequest>[];
  }): void => {
    if (!isElementNode(element)) {
      return;
    }

    updateRemoteElementProperty(element, bridgeProperty, commands);
  };

  const updatePendingCommands = ({
    element,
    commands,
  }: {
    element: object;
    commands: RemoteElementCommand<TRequest>[];
  }): void => {
    pendingCommandsByElement.set(element, commands);
    sendPendingCommandsToHost({ element, commands });
  };

  const readPendingCommands = (
    element: object,
  ): RemoteElementCommand<TRequest>[] =>
    pendingCommandsByElement.get(element) ?? [];

  const enqueueCommand = ({
    element,
    request,
  }: {
    element: object;
    request: TRequest;
  }): void => {
    lastCommandSequence += 1;

    const commands = [
      ...readPendingCommands(element),
      {
        sequence: lastCommandSequence,
        request,
        acknowledgedNativeEditSequence:
          readAcknowledgedNativeEditSequence?.(element),
      },
    ];

    updatePendingCommands({
      element,
      commands: commands.slice(-maxPendingCommands),
    });
  };

  const acknowledgeCommands = ({
    element,
    acknowledgedCommandSequence,
  }: {
    element: object;
    acknowledgedCommandSequence: number;
  }): void => {
    const pendingCommands = pendingCommandsByElement.get(element);

    if (!isDefined(pendingCommands)) {
      return;
    }

    const unacknowledgedCommands = pendingCommands.filter(
      ({ sequence }) => sequence > acknowledgedCommandSequence,
    );
    const hasAcknowledgedAnyCommand =
      unacknowledgedCommands.length < pendingCommands.length;

    if (!hasAcknowledgedAnyCommand) {
      return;
    }

    updatePendingCommands({ element, commands: unacknowledgedCommands });
  };

  const discardPendingCommands = (element: object): void => {
    const hadPendingCommands = pendingCommandsByElement.delete(element);

    if (!hadPendingCommands) {
      return;
    }

    sendPendingCommandsToHost({ element, commands: [] });
  };

  return {
    readPendingCommands,
    enqueueCommand,
    acknowledgeCommands,
    discardPendingCommands,
  };
};
