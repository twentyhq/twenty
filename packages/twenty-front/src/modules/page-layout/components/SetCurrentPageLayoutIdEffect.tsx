import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type SetCurrentPageLayoutIdEffectProps = {
  pageLayoutId: string | null;
};

export const SetCurrentPageLayoutIdEffect = ({
  pageLayoutId,
}: SetCurrentPageLayoutIdEffectProps) => {
  const store = useStore();

  useEffect(() => {
    if (isDefined(pageLayoutId)) {
      store.set(currentPageLayoutIdState.atom, pageLayoutId);
    }
  }, [pageLayoutId, store]);

  return null;
};
