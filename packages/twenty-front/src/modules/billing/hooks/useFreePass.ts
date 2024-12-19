import { freePassState } from '@/billing/states/freePassState';
import { useLocation } from 'react-router-dom';
import { useRecoilState } from 'recoil';

export const useFreePass = () => {
  const { search } = useLocation();
  const [freePass, setFreePass] = useRecoilState(freePassState);

  const hasFreePassParameter =
    search.includes('freepass') ||
    search.includes('freePass') ||
    search.includes('free-pass') ||
    search.includes('Free-pass') ||
    search.includes('FreePass');

  if (hasFreePassParameter) {
    setFreePass(true);
  }

  return freePass;
};
