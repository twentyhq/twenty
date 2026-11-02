import { contextStorePageTitleComponentState } from '@/context-store/states/contextStorePageTitleComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

type ContextStorePageTitleEffectProps = {
  pageTitle: string | null;
};

export const ContextStorePageTitleEffect = ({
  pageTitle,
}: ContextStorePageTitleEffectProps) => {
  const setContextStorePageTitle = useSetAtomComponentState(
    contextStorePageTitleComponentState,
  );

  useEffect(() => {
    setContextStorePageTitle(pageTitle);
  }, [pageTitle, setContextStorePageTitle]);

  useEffect(() => {
    return () => {
      setContextStorePageTitle(null);
    };
  }, [setContextStorePageTitle]);

  return null;
};
