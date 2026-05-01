import { useEffect } from 'react';

// @hello-pangea/dnd installs a window 'error' listener that catches ANY
// unhandled error and dispatches a FLUSH action to abort the current drag.
// During FLUSH, `stopPublishing` calls `dragStopped()` on ALL registered
// Droppables — even those that were never involved in a drag — which throws
// "Invariant failed" when `whileDraggingRef.current` is null. This secondary
// invariant error is a library bug that cascades from unrelated app errors
// (e.g. failed GraphQL requests). We suppress it here to prevent the
// secondary crash from reaching the user.
export const useSuppressDndInvariantErrors = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.error?.message === 'Invariant failed' &&
        event.error?.toString?.()?.includes?.('Invariant')
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
};
