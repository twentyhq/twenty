import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { type InputSelectionCommand } from '@/types/InputSelectionCommand';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';

export const createInputSelectionCommandQueue = () => {
  const pendingCommandsByElement = new WeakMap<
    object,
    InputSelectionCommand[]
  >();

  let lastCommandSequence = 0;

  const sendPendingCommandsToHost = ({
    element,
    commands,
  }: {
    element: object;
    commands: InputSelectionCommand[];
  }): void => {
    updateRemoteElementProperty(
      element as Element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      commands,
    );
  };

  const updatePendingCommands = ({
    element,
    commands,
  }: {
    element: object;
    commands: InputSelectionCommand[];
  }): void => {
    pendingCommandsByElement.set(element, commands);
    sendPendingCommandsToHost({ element, commands });
  };

  const readPendingCommands = (element: object): InputSelectionCommand[] =>
    pendingCommandsByElement.get(element) ?? [];

  const enqueueCommand = ({
    element,
    request,
  }: {
    element: object;
    request: InputSelectionRequest;
  }): void => {
    lastCommandSequence += 1;

    updatePendingCommands({
      element,
      commands: [
        ...readPendingCommands(element),
        { sequence: lastCommandSequence, request },
      ],
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
