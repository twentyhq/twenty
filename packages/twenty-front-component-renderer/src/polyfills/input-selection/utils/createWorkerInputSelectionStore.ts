import { updateRemoteElementProperty } from '@remote-dom/core/elements';

import { INPUT_SELECTION_BRIDGE_PROPERTIES } from '@/constants/InputSelectionBridgeProperties';
import { isElementUnderRemoteRoot } from '@/polyfills/geometry/utils/isElementUnderRemoteRoot';
import { type InputSelectionUpdateListener } from '@/polyfills/input-selection/types/InputSelectionUpdateListener';
import { type WorkerInputSelectionStore } from '@/polyfills/input-selection/types/WorkerInputSelectionStore';
import { createInputSelectionCommandQueue } from '@/polyfills/input-selection/utils/createInputSelectionCommandQueue';
import { resolveOptimisticInputSelectionState } from '@/polyfills/input-selection/utils/resolveOptimisticInputSelectionState';
import { type InputSelectionRequest } from '@/types/InputSelectionRequest';
import { type InputSelectionState } from '@/types/InputSelectionState';

export const createWorkerInputSelectionStore =
  (): WorkerInputSelectionStore => {
    const commandQueue = createInputSelectionCommandQueue();
    const hostSelectionStates = new WeakMap<object, InputSelectionState>();
    const hostSelectionSubscriptions = new WeakMap<
      object,
      InputSelectionUpdateListener
    >();
    const trackedElements = new Set<object>();

    let rootElement: object | null = null;
    let hasScheduledDetachedElementSweep = false;

    const renewHostSelectionSubscription = (element: object): void => {
      const handleSelectionUpdate: InputSelectionUpdateListener = (
        snapshot,
      ) => {
        const isLatestSubscription =
          hostSelectionSubscriptions.get(element) === handleSelectionUpdate;

        if (
          !isLatestSubscription ||
          !isElementUnderRemoteRoot(element, rootElement)
        ) {
          return;
        }

        hostSelectionStates.set(element, snapshot);
        trackedElements.add(element);
        commandQueue.acknowledgeCommands({
          element,
          acknowledgedCommandSequence: snapshot.selectionCommandSequence ?? 0,
        });
      };

      hostSelectionSubscriptions.set(element, handleSelectionUpdate);
      updateRemoteElementProperty(
        element as Element,
        INPUT_SELECTION_BRIDGE_PROPERTIES.update,
        handleSelectionUpdate,
      );
    };

    const subscribeToHostSelection = (element: object): void => {
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return;
      }

      trackedElements.add(element);

      if (hostSelectionSubscriptions.has(element)) {
        return;
      }

      renewHostSelectionSubscription(element);
    };

    const forgetDetachedElement = (element: object): void => {
      trackedElements.delete(element);
      hostSelectionStates.delete(element);
      commandQueue.discardPendingCommands(element);

      if (hostSelectionSubscriptions.has(element)) {
        renewHostSelectionSubscription(element);
      }
    };

    const sweepDetachedElements = (): void => {
      hasScheduledDetachedElementSweep = false;

      for (const element of trackedElements) {
        if (isElementUnderRemoteRoot(element, rootElement)) {
          continue;
        }

        forgetDetachedElement(element);
      }
    };

    const scheduleDetachedElementSweep = (): void => {
      if (hasScheduledDetachedElementSweep || trackedElements.size === 0) {
        return;
      }

      hasScheduledDetachedElementSweep = true;
      queueMicrotask(sweepDetachedElements);
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
        trackedElements.add(element);
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
      if (!isElementUnderRemoteRoot(element, rootElement)) {
        return;
      }

      subscribeToHostSelection(element);
      commandQueue.enqueueCommand({ element, request });
    };

    return {
      setRootElement: (nextRootElement: object) => {
        rootElement = nextRootElement;
      },
      applySnapshot,
      scheduleDetachedElementSweep,
      read: readSelection,
      request: requestSelection,
    };
  };
