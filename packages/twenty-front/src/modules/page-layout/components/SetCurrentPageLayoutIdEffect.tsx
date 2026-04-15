import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useStore } from 'jotai';
import { useEffect } from 'react';

type SetCurrentPageLayoutIdEffectProps = {
  pageLayoutId: string | null;
};

export const SetCurrentPageLayoutIdEffect = ({
  pageLayoutId,
}: SetCurrentPageLayoutIdEffectProps) => {
  const store = useStore();

  useEffect(() => {
    store.set(currentPageLayoutIdState.atom, pageLayoutId);
  }, [pageLayoutId, store]);

  return null;
};
