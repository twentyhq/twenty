import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FOCUS_TRANSPORT_FAILURE_WARNING } from '@/host/constants/FocusTransportFailureWarning';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentFocusTrackerEffectProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
};

export const FrontComponentFocusTrackerEffect = ({
  thread,
  geometryTracker,
}: FrontComponentFocusTrackerEffectProps) => {
  useEffect(() => {
    let focusedRemoteElementId: string | null = null;
    let hasWarnedAboutFocusPushFailure = false;

    const pushFocusedRemoteElementId = (
      remoteElementId: string | null,
    ): void => {
      if (remoteElementId === focusedRemoteElementId) {
        return;
      }

      focusedRemoteElementId = remoteElementId;

      thread.imports.pushFocusedRemoteElementId(remoteElementId).catch(() => {
        if (hasWarnedAboutFocusPushFailure) {
          return;
        }

        hasWarnedAboutFocusPushFailure = true;
        console.warn(FOCUS_TRANSPORT_FAILURE_WARNING);
      });
    };

    const handleFocusIn = (event: FocusEvent): void => {
      pushFocusedRemoteElementId(
        geometryTracker.findRemoteElementIdContainingNode(event.target) ?? null,
      );
    };

    const handleFocusOut = (event: FocusEvent): void => {
      if (
        isDefined(
          geometryTracker.findRemoteElementIdContainingNode(
            event.relatedTarget,
          ),
        )
      ) {
        return;
      }

      pushFocusedRemoteElementId(null);
    };

    // Capture on the document so the worker learns the new focus before
    // React forwards the focused element's own handlers.
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);

    pushFocusedRemoteElementId(
      geometryTracker.findRemoteElementIdContainingNode(
        document.activeElement,
      ) ?? null,
    );

    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };
  }, [thread, geometryTracker]);

  return null;
};
