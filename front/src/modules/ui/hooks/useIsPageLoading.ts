import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { currentPageLocationState } from '../states/currentPageLocationState';

export function useIsPageLoading() {
  const currentLocation = useLocation().pathname;

  const currentPageLocation = useRecoilValue(currentPageLocationState);

  console.log({
    currentLocation,
    currentPageLocation,
  });

  return currentLocation !== currentPageLocation;
}
