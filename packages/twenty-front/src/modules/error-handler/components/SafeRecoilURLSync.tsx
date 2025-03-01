import { ReactNode, useEffect, useState } from 'react';
import { RecoilURLSyncJSON } from 'recoil-sync';

export const SafeRecoilURLSync = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Clear any existing error state on component mount
    setHasError(false);

    // Set up error handler
    const handleError = (event: any) => {
      const hasSnapshotError = Boolean(
        event.error?.message?.includes('Snapshot has already been released'),
      );

      if (hasSnapshotError === true) {
        event.preventDefault(); // Prevent the error from bubbling up
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);

    // Firefox-specific delay for initialization
    const isFirefox = Boolean(
      navigator.userAgent.toLowerCase().includes('firefox'),
    );

    if (isFirefox === true) {
      const initializationTimeout = setTimeout(() => {
        setHasError(false); // Reset error state after delay
      }, 300);

      return () => {
        clearTimeout(initializationTimeout);
        window.removeEventListener('error', handleError);
      };
    }

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // If we detected an error, render without RecoilURLSyncJSON
  if (hasError === true) {
    return children;
  }

  // Otherwise use RecoilURLSyncJSON
  return (
    <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
      {children}
    </RecoilURLSyncJSON>
  );
};
