import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type WorkerInputSelectionStore } from '@/polyfills/input-selection/types/WorkerInputSelectionStore';
import { resolveOptimisticInputSelectionState } from '@/polyfills/input-selection/utils/resolveOptimisticInputSelectionState';
import { createRemoteElementCommandQueue } from '@/polyfills/utils/createRemoteElementCommandQueue';
import { createRemoteElementHostSubscriptions } from '@/polyfills/utils/createRemoteElementHostSubscriptions';
import { acknowledgedNativeEditSequenceByRemoteElement } from '@/remote/elements/states/acknowledgedNativeEditSequenceByRemoteElement';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';
import { type InputSelectionState } from '@/types/InputSelectionState';

export const createWorkerInputSelectionStore =
  (): WorkerInputSelectionStore => {
    const commandQueue = createRemoteElementCommandQueue<InputSelectionRequest>(
      {
        bridgeProperty: INPUT_SELECTION_BRIDGE_PROPERTIES.request,
        readAcknowledgedNativeEditSequence: (element) =>
          acknowledgedNativeEditSequenceByRemoteElement.get(element),
      },
    );
    const hostSelectionStates = new WeakMap<object, InputSelectionState>();
    let rootElement: object | null = null;

    const hostSelectionSubscriptions =
      createRemoteElementHostSubscriptions<InputSelectionSnapshot>({
        updateBridgeProperty: INPUT_SELECTION_BRIDGE_PROPERTIES.update,
        readRootElement: () => rootElement,
        onHostUpdate: ({ element, hostUpdate: snapshot }) => {
          hostSelectionStates.set(element, snapshot);
          hostSelectionSubscriptions.trackElement(element);
          commandQueue.acknowledgeCommands({
            element,
            acknowledgedCommandSequence: snapshot.selectionCommandSequence ?? 0,
          });
        },
        onForgetElement: (element) => {
          hostSelectionStates.delete(element);
          commandQueue.discardPendingCommands(element);
        },
      });

    const subscribeToHostSelection = (element: object): boolean => {
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return false;
      }

      hostSelectionSubscriptions.subscribe(element);

      return true;
    };

    const applySnapshot = ({
      element,
      state,
    }: {
      element: object;
      state: InputSelectionState;
    }): void => {
      hostSelectionStates.set(element, state);

      if (isElementUnderRemoteRoot(element, rootElement)) {
        hostSelectionSubscriptions.trackElement(element);
      }
    };

    const readSelection = (element: object): InputSelectionState => {
      subscribeToHostSelection(element);

      return resolveOptimisticInputSelectionState({
        hostState: hostSelectionStates.get(element),
        pendingCommands: commandQueue.readPendingCommands(element),
        value: (element as { value?: unknown }).value,
      });
    };

    const requestSelection = ({
      element,
      request,
    }: {
      element: object;
      request: InputSelectionRequest;
    }): void => {
      if (!subscribeToHostSelection(element)) {
        return;
      }

      commandQueue.enqueueCommand({ element, request });
    };

    return {
      setRootElement: (nextRootElement: object) => {
        rootElement = nextRootElement;
      },
      applySnapshot,
      scheduleDetachedElementSweep:
        hostSelectionSubscriptions.scheduleDetachedElementSweep,
      read: readSelection,
      request: requestSelection,
    };
  };
