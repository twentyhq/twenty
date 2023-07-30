import { ReactNode, useEffect, useState } from 'react';

interface IOfflineScreenWrapper {
  children: ReactNode;
}

export function OfflineScreenWrapper(
  props: IOfflineScreenWrapper,
): JSX.Element {
  const [isOffline, setIsOffline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(true);
    };

    const handleOffline = () => {
      setIsOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    console.log('offline screen render');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return <div>{isOffline ? <div>offline</div> : props.children}</div>;
}
