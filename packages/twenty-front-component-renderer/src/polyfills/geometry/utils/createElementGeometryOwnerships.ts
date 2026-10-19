import { isDefined } from 'twenty-shared/utils';

import { type ElementGeometryReader } from '@/polyfills/geometry/types/ElementGeometryReader';
import { type ElementGeometrySnapshot } from '@/types/ElementGeometrySnapshot';

type ElementGeometryOwnership = {
  remoteElementId: string | null;
  readerCount: number;
  hasDirectReader: boolean;
  hasScheduledRelease: boolean;
};

export const createElementGeometryOwnerships = ({
  isObservedRemoteElementId,
  isPendingObservation,
  releaseRemoteElement,
}: {
  isObservedRemoteElementId: (remoteElementId: string) => boolean;
  isPendingObservation: (remoteElementId: string) => boolean;
  releaseRemoteElement: (remoteElementId: string) => void;
}) => {
  const elementOwnerships = new WeakMap<object, ElementGeometryOwnership>();

  const getElementOwnership = (element: object): ElementGeometryOwnership => {
    const existingOwnership = elementOwnerships.get(element);

    if (isDefined(existingOwnership)) {
      return existingOwnership;
    }

    const ownership: ElementGeometryOwnership = {
      remoteElementId: null,
      readerCount: 0,
      hasDirectReader: false,
      hasScheduledRelease: false,
    };
    elementOwnerships.set(element, ownership);

    return ownership;
  };

  const hasRemainingReader = (ownership: ElementGeometryOwnership): boolean =>
    ownership.hasDirectReader || ownership.readerCount > 0;

  const readObservedRemoteElementId = (element: object): string | null => {
    const remoteElementId = elementOwnerships.get(element)?.remoteElementId;

    return isDefined(remoteElementId) &&
      isObservedRemoteElementId(remoteElementId)
      ? remoteElementId
      : null;
  };

  const assignRemoteElementId = ({
    element,
    remoteElementId,
  }: {
    element: object;
    remoteElementId: string | null;
  }): void => {
    getElementOwnership(element).remoteElementId = remoteElementId;
  };

  const markDirectReader = (element: object): void => {
    const ownership = getElementOwnership(element);

    if (isDefined(ownership.remoteElementId)) {
      ownership.hasDirectReader = true;
    }
  };

  const releaseWhenUnused = (ownership: ElementGeometryOwnership): void => {
    ownership.hasScheduledRelease = false;
    const remoteElementId = ownership.remoteElementId;

    if (hasRemainingReader(ownership) || !isDefined(remoteElementId)) {
      return;
    }

    ownership.remoteElementId = null;
    releaseRemoteElement(remoteElementId);
  };

  const createElementGeometryReader = ({
    element,
    readSnapshot,
  }: {
    element: object;
    readSnapshot: (element: object) => ElementGeometrySnapshot | null;
  }): ElementGeometryReader => {
    const ownership = getElementOwnership(element);
    const elementRef = new WeakRef(element);
    ownership.readerCount += 1;
    let isReleased = false;

    return {
      read: () => {
        const currentElement = elementRef.deref();

        if (isReleased || !isDefined(currentElement)) {
          return null;
        }

        return readSnapshot(currentElement);
      },
      release: () => {
        if (isReleased) {
          return;
        }

        isReleased = true;
        ownership.readerCount -= 1;
        const remoteElementId = ownership.remoteElementId;

        if (hasRemainingReader(ownership) || !isDefined(remoteElementId)) {
          return;
        }

        if (isPendingObservation(remoteElementId)) {
          releaseWhenUnused(ownership);
          return;
        }

        if (ownership.hasScheduledRelease) {
          return;
        }

        ownership.hasScheduledRelease = true;
        queueMicrotask(() => releaseWhenUnused(ownership));
      },
    };
  };

  return {
    readObservedRemoteElementId,
    assignRemoteElementId,
    markDirectReader,
    createElementGeometryReader,
  };
};
