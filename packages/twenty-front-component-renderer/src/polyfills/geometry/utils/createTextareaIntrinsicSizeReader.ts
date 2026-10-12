import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

const TEXTAREA_TAG_NAMES = new Set(['TEXTAREA', 'HTML-TEXTAREA']);

type ReadTextareaIntrinsicSizeInput = {
  element: object;
  snapshot: ElementGeometrySnapshot | null;
};

type TextareaPendingMeasurement = {
  blockSize: string;
  hasReceivedSnapshot: boolean;
};

export const createTextareaIntrinsicSizeReader = (
  geometryStore: WorkerGeometryStore,
) => {
  const pendingMeasurements = new Map<
    HTMLElement,
    TextareaPendingMeasurement
  >();

  geometryStore.subscribeToGeometryUpdates(() => {
    for (const [textarea, measurement] of pendingMeasurements) {
      if (textarea.style.blockSize !== measurement.blockSize) {
        pendingMeasurements.delete(textarea);
        continue;
      }

      const snapshot = geometryStore.resolveElementSnapshot(textarea);
      const isDetached = !textarea.isConnected;
      const hasLostSnapshot =
        !isDefined(snapshot) && measurement.hasReceivedSnapshot;

      if (isDetached || hasLostSnapshot) {
        pendingMeasurements.delete(textarea);
        continue;
      }

      if (!isDefined(snapshot)) {
        continue;
      }

      if (!isDefined(snapshot.textareaIntrinsicScrollHeight)) {
        pendingMeasurements.delete(textarea);
        continue;
      }

      const borderBlockSize = snapshot.offsetHeight - snapshot.clientHeight;
      const blockSize = `${snapshot.textareaIntrinsicScrollHeight + borderBlockSize}px`;
      if (measurement.blockSize !== blockSize) {
        textarea.style.blockSize = blockSize;
      }

      pendingMeasurements.set(textarea, {
        blockSize,
        hasReceivedSnapshot: true,
      });
    }
  });

  return ({ element, snapshot }: ReadTextareaIntrinsicSizeInput): number => {
    const textarea = element as HTMLElement;
    const isMeasuringTextareaContent =
      TEXTAREA_TAG_NAMES.has(textarea.tagName) &&
      textarea.style.blockSize === 'auto';

    if (!isMeasuringTextareaContent) {
      return snapshot?.scrollHeight ?? 0;
    }

    const scrollHeight =
      snapshot?.textareaIntrinsicScrollHeight ?? snapshot?.scrollHeight ?? 0;
    const borderBlockSize =
      (snapshot?.offsetHeight ?? 0) - (snapshot?.clientHeight ?? 0);
    pendingMeasurements.set(textarea, {
      blockSize: `${scrollHeight + borderBlockSize}px`,
      hasReceivedSnapshot: isDefined(snapshot),
    });

    return scrollHeight;
  };
};
