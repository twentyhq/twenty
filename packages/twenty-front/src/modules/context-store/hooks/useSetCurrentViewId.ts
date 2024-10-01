import { currentViewIdState } from '@/context-store/states/currentViewIdState';
import { useSetRecoilState } from 'recoil';

export const useSetCurrentViewId = () => {
  const setCurrentViewId = useSetRecoilState(currentViewIdState);
  return { setCurrentViewId };
};
