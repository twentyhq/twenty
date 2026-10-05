import { updateRemoteElementProperty } from '@remote-dom/core/elements';
import { isDefined } from 'twenty-shared/utils';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type InputSelectionCommand } from '@/types/InputSelectionCommand';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionState } from '@/types/InputSelectionState';

type InputSelectionSnapshot = InputSelectionState & {
  selectionCommandSequence?: number;
};

export const createWorkerInputSelectionStore = () => {
  let rootElement: object | null = null;
  const states = new WeakMap<object, InputSelectionState>();
  const pendingCommands = new WeakMap<object, InputSelectionCommand[]>();
  let commandSequence = 0;
  const subscriptions = new WeakMap<
    object,
    (state: InputSelectionSnapshot) => void
  >();

  const updatePendingCommands = ({
    element,
    commands,
  }: {
    element: Element;
    commands: InputSelectionCommand[];
  }) => {
    pendingCommands.set(element, commands);
    updateRemoteElementProperty(
      element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.request,
      commands,
    );
  };

  const applySnapshot = ({
    element,
    state,
  }: {
    element: object;
    state: InputSelectionState;
  }) => {
    states.set(element, state);
  };

  const replaceSubscription = (element: Element) => {
    const handleSelectionUpdate = (state: InputSelectionSnapshot) => {
      if (
        subscriptions.get(element) !== handleSelectionUpdate ||
        !isElementUnderRemoteRoot(element, rootElement)
      ) {
        return;
      }

      applySnapshot({ element, state });

      const commands = pendingCommands.get(element);

      if (!isDefined(commands)) {
        return;
      }

      const acknowledgedSequence = state.selectionCommandSequence ?? 0;
      const unacknowledgedCommands = commands.filter(
        ({ sequence }) => sequence > acknowledgedSequence,
      );

      if (unacknowledgedCommands.length === commands.length) {
        return;
      }

      updatePendingCommands({ element, commands: unacknowledgedCommands });
    };

    subscriptions.set(element, handleSelectionUpdate);
    updateRemoteElementProperty(
      element,
      INPUT_SELECTION_BRIDGE_PROPERTIES.update,
      handleSelectionUpdate,
    );
  };

  const subscribe = (element: Element) => {
    if (
      subscriptions.has(element) ||
      !isElementUnderRemoteRoot(element, rootElement)
    ) {
      return;
    }

    replaceSubscription(element);
  };

  return {
    setRootElement: (element: object) => {
      rootElement = element;
    },
    applySnapshot,
    clearSubtree: (rootNode: object) => {
      for (const element of iterateElementSubtree(rootNode)) {
        states.delete(element);

        if (pendingCommands.delete(element)) {
          updateRemoteElementProperty(
            element as Element,
            INPUT_SELECTION_BRIDGE_PROPERTIES.request,
            [],
          );
        }

        if (subscriptions.has(element)) {
          replaceSubscription(element as Element);
        }
      }
    },
    read: (element: Element): InputSelectionState => {
      subscribe(element);
      const state = states.get(element);
      if (isDefined(state)) {
        return state;
      }
      return { selectionStart: 0, selectionEnd: 0, selectionDirection: 'none' };
    },
    request: ({
      element,
      request,
    }: {
      element: Element;
      request: InputSelectionRequest;
    }) => {
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return;
      }
      subscribe(element);
      const commands = [
        ...(pendingCommands.get(element) ?? []),
        { sequence: ++commandSequence, request },
      ];
      updatePendingCommands({ element, commands });
    },
  };
};
