import { currentViewIdState } from '@/context-store/states/currentViewIdState';
import { useRecoilValue } from 'recoil';

export const useCurrentViewId = () => {
  const currentViewId = useRecoilValue(currentViewIdState);
  return { currentViewId };
};
