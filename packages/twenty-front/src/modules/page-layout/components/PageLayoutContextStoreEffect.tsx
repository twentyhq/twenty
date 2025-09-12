import { contextStorePageLayoutIdComponentState } from '@/context-store/states/contextStorePageLayoutIdComponentState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

type PageLayoutContextStoreEffectProps = {
  pageLayoutId: string;
};

export const PageLayoutContextStoreEffect = ({
  pageLayoutId,
}: PageLayoutContextStoreEffectProps) => {
  const setContextStorePageLayoutId = useSetRecoilComponentState(
    contextStorePageLayoutIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  useEffect(() => {
    setContextStorePageLayoutId(pageLayoutId);
  }, [pageLayoutId, setContextStorePageLayoutId]);

  return null;
};
