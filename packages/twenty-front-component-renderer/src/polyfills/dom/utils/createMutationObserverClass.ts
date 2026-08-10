import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type MutationObserverRegistry } from '@/polyfills/dom/types/MutationObserverRegistry';
import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';
import { type WorkerMutationObserver } from '@/polyfills/dom/types/WorkerMutationObserver';
import { type WorkerMutationObserverCallback } from '@/polyfills/dom/types/WorkerMutationObserverCallback';
import { type WorkerMutationRecord } from '@/polyfills/dom/types/WorkerMutationRecord';
import { normalizeMutationObserverInit } from '@/polyfills/dom/utils/normalizeMutationObserverInit';

type CreateMutationObserverClassInput = {
  registry: MutationObserverRegistry;
  reportCallbackError: (error: unknown) => void;
};

export const createMutationObserverClass = ({
  registry,
  reportCallbackError,
}: CreateMutationObserverClassInput) => {
  const pendingDeliveries = new Set<() => void>();
  let isDeliveryScheduled = false;

  const deliverPendingRecords = () => {
    isDeliveryScheduled = false;

    const deliveries = [...pendingDeliveries];
    pendingDeliveries.clear();

    for (const deliverRecords of deliveries) {
      deliverRecords();
    }
  };

  const scheduleDelivery = (deliverRecords: () => void) => {
    pendingDeliveries.add(deliverRecords);

    if (isDeliveryScheduled) {
      return;
    }

    isDeliveryScheduled = true;
    queueMicrotask(deliverPendingRecords);
  };

  return class MutationObserverImplementation implements WorkerMutationObserver {
    #callback: WorkerMutationObserverCallback;
    #records: WorkerMutationRecord[] = [];
    #targetRefs = new Set<WeakRef<Node>>();
    #targetRefByTarget = new WeakMap<Node, WeakRef<Node>>();

    #deliverRecords = () => {
      registry.clearTransientObservations({ sink: this.#sink });

      const records = this.takeRecords();

      if (records.length === 0) {
        return;
      }

      try {
        this.#callback(records, this);
      } catch (error) {
        reportCallbackError(error);
      }
    };

    #sink: MutationRecordSink = {
      enqueueMutationRecord: (record) => {
        this.#records.push(record);
        scheduleDelivery(this.#deliverRecords);
      },
      scheduleDelivery: () => {
        scheduleDelivery(this.#deliverRecords);
      },
    };

    constructor(callback: WorkerMutationObserverCallback) {
      if (!isFunction(callback)) {
        throw new TypeError(
          "Failed to construct 'MutationObserver': parameter 1 is not of type 'Function'.",
        );
      }

      this.#callback = callback;
    }

    observe(target: Node, options: MutationObserverInit = {}): void {
      const normalizedOptions = normalizeMutationObserverInit(options);

      const existingTargetRef = this.#targetRefByTarget.get(target);

      if (
        !isDefined(existingTargetRef) ||
        !this.#targetRefs.has(existingTargetRef)
      ) {
        const targetRef = new WeakRef(target);

        this.#targetRefByTarget.set(target, targetRef);
        this.#targetRefs.add(targetRef);
      }

      registry.registerObservation({
        target,
        sink: this.#sink,
        options: normalizedOptions,
      });
    }

    disconnect(): void {
      const liveTargets = [...this.#targetRefs]
        .map((targetRef) => targetRef.deref())
        .filter(isDefined);

      registry.unregisterObservations({
        targets: liveTargets,
        sink: this.#sink,
      });
      registry.clearTransientObservations({ sink: this.#sink });

      this.#targetRefs.clear();
      this.#records = [];
      pendingDeliveries.delete(this.#deliverRecords);
    }

    takeRecords(): WorkerMutationRecord[] {
      const records = this.#records;
      this.#records = [];

      return records;
    }
  };
};
