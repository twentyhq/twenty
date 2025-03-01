import { ReactNode, useEffect, useState } from 'react';
import { RecoilURLSyncJSON } from 'recoil-sync';

export const SafeRecoilURLSync = ({ children }: { children: ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const handleError = (event: any) => {
      const hasSnapshotError = Boolean(
        event.error?.message?.includes('Snapshot has already been released'),
      );

      if (hasSnapshotError === true) {
        event.preventDefault();
        setHasError(true);
      }
    };

    window.addEventListener('error', handleError);

    const isFirefox = Boolean(
      navigator.userAgent.toLowerCase().includes('firefox'),
    );

    if (isFirefox === true) {
      const initializationTimeout = setTimeout(() => {
        setIsInitializing(false); // Only mark initialization as complete
      }, 300);

      return () => {
        clearTimeout(initializationTimeout);
        window.removeEventListener('error', handleError);
      };
    }

    setIsInitializing(false);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Only render without RecoilURLSyncJSON if we have an error and aren't still initializing
  if (hasError === true && isInitializing === false) {
    return children;
  }

  return (
    <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
      {children}
    </RecoilURLSyncJSON>
  );
};