import { isDefined } from 'twenty-shared/utils';

import { type TextareaIntrinsicSizeElement } from '@/polyfills/geometry/types/TextareaIntrinsicSizeElement';
import { type WorkerGeometryStore } from '@/polyfills/geometry/types/WorkerGeometryStore';
import { resolveHtmlTagNameOfElement } from '@/polyfills/selectors/utils/resolveHtmlTagNameOfElement';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type ReadTextareaIntrinsicSizeInput = {
  element: TextareaIntrinsicSizeElement;
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
    TextareaIntrinsicSizeElement,
    TextareaPendingMeasurement
  >();

  geometryStore.subscribeToGeometryUpdates(() => {
    for (const [textarea, measurement] of pendingMeasurements) {
      if (textarea.style?.blockSize !== measurement.blockSize) {
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
      if (measurement.blockSize !== blockSize && isDefined(textarea.style)) {
        textarea.style.blockSize = blockSize;
      }

      pendingMeasurements.set(textarea, {
        blockSize,
        hasReceivedSnapshot: true,
      });
    }
  });

  return ({ element, snapshot }: ReadTextareaIntrinsicSizeInput): number => {
    const isMeasuringTextareaContent =
      resolveHtmlTagNameOfElement(element) === 'textarea' &&
      element.style?.blockSize === 'auto';

    if (!isMeasuringTextareaContent) {
      return snapshot?.scrollHeight ?? 0;
    }

    if (!isDefined(snapshot)) {
      pendingMeasurements.set(element, {
        blockSize: 'auto',
        hasReceivedSnapshot: false,
      });

      return 0;
    }

    const scrollHeight =
      snapshot.textareaIntrinsicScrollHeight ?? snapshot.scrollHeight;
    pendingMeasurements.set(element, {
      blockSize: formatTextareaBlockSize({ scrollHeight, snapshot }),
      hasReceivedSnapshot: true,
    });

    return scrollHeight;
  };
};
