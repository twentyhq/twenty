import { isFunction } from '@sniptt/guards';

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
    #targets = new Set<Node>();

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

      this.#targets.add(target);

      registry.registerObservation({
        target,
        sink: this.#sink,
        options: normalizedOptions,
      });
    }

    disconnect(): void {
      registry.unregisterObservations({
        targets: this.#targets,
        sink: this.#sink,
      });
      registry.clearTransientObservations({ sink: this.#sink });

      this.#targets.clear();
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
