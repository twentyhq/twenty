import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { isInitializingHotkeyScopeState } from '../modules/ui/states/isInitializingHotkeyScopeState';

export function PageInitializationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('PageInitializationProvider');
  // const [, setIsInitializingPage] = useRecoilState(
  //   isInitializingHotkeyScopeState,
  // );
  // const [currentLocation, setCurrentLocation] = useState('');

  // const location = useLocation();

  // useEffect(() => {
  //   console.log('PageInitializationHook: useEffect');
  //   if (currentLocation !== location.pathname) {
  //     setCurrentLocation(location.pathname);
  //     console.log('PageInitializationHook: setIsInitializingPage(true)');
  //     setIsInitializingPage(true);
  //   }
  // }, [location, currentLocation, setIsInitializingPage]);

  return <>{children}</>;
}
