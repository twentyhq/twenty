import { isDefined } from 'twenty-shared/utils';

import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FocusUpdate } from '@/types/FocusUpdate';

type TrackHostFocusInput = {
  geometryTracker: GeometryTracker;
  pushFocusUpdate: (update: FocusUpdate) => void;
};

export const trackHostFocus = ({
  geometryTracker,
  pushFocusUpdate,
}: TrackHostFocusInput): (() => void) => {
  let previousUpdate: FocusUpdate = {
    remoteElementId: null,
    isFocusVisible: false,
  };

  const pushFocusedElement = (element: Element | null): void => {
    const remoteElementId =
      geometryTracker.findRemoteElementIdContainingNode(element) ?? null;
    const isFocusVisible =
      isDefined(remoteElementId) &&
      (element?.matches(':focus-visible') ?? false);

    if (
      remoteElementId === previousUpdate.remoteElementId &&
      isFocusVisible === previousUpdate.isFocusVisible
    ) {
      return;
    }

    previousUpdate = { remoteElementId, isFocusVisible };
    pushFocusUpdate(previousUpdate);
  };

  const pushActiveElement = (): void => {
    pushFocusedElement(document.activeElement);
  };

  const handleFocusOut = (event: FocusEvent): void => {
    if (
      isDefined(
        geometryTracker.findRemoteElementIdContainingNode(event.relatedTarget),
      )
    ) {
      return;
    }

    pushFocusedElement(null);
  };

  document.addEventListener('focusin', pushActiveElement, true);
  document.addEventListener('focusout', handleFocusOut, true);
  document.addEventListener('keydown', pushActiveElement, true);
  pushActiveElement();

  return () => {
    document.removeEventListener('focusin', pushActiveElement, true);
    document.removeEventListener('focusout', handleFocusOut, true);
    document.removeEventListener('keydown', pushActiveElement, true);
  };
};
