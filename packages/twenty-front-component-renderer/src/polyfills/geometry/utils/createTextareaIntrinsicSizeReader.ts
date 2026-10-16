import { isDefined } from 'twenty-shared/utils';

import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type ReadTextareaIntrinsicSizeInput = {
  element: object;
  snapshot: ElementGeometrySnapshot | null;
};

type TextareaPendingMeasurement = {
  blockSize: string;
  hasReceivedSnapshot: boolean;
};

const formatTextareaBlockSize = ({
  scrollHeight,
  snapshot,
}: {
  scrollHeight: number;
  snapshot: ElementGeometrySnapshot;
}): string => {
  const borderBlockSize = snapshot.offsetHeight - snapshot.clientHeight;

  return `${scrollHeight + borderBlockSize}px`;
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

      const blockSize = formatTextareaBlockSize({
        scrollHeight: snapshot.textareaIntrinsicScrollHeight,
        snapshot,
      });
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
      resolveHtmlTagNameOfElement(element) === 'textarea' &&
      textarea.style.blockSize === 'auto';

    if (!isMeasuringTextareaContent) {
      return snapshot?.scrollHeight ?? 0;
    }

    if (!isDefined(snapshot)) {
      pendingMeasurements.set(textarea, {
        blockSize: 'auto',
        hasReceivedSnapshot: false,
      });

      return 0;
    }

    const scrollHeight =
      snapshot.textareaIntrinsicScrollHeight ?? snapshot.scrollHeight;
    pendingMeasurements.set(textarea, {
      blockSize: formatTextareaBlockSize({ scrollHeight, snapshot }),
      hasReceivedSnapshot: true,
    });

    return scrollHeight;
  };
};
