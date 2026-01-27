import { useEffect } from 'react';

import { useResetDraftPageLayoutToPersistedPageLayout } from '@/page-layout/hooks/useResetDraftPageLayoutToPersistedPageLayout';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutIsInitializedComponentState } from '@/page-layout/states/pageLayoutIsInitializedComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

type PageLayoutUnmountCleanupEffectProps = {
  pageLayoutId?: string;
};

export const PageLayoutUnmountCleanupEffect = ({
  pageLayoutId: pageLayoutIdFromProps,
}: PageLayoutUnmountCleanupEffectProps) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const { setIsPageLayoutInEditMode } =
    useSetIsPageLayoutInEditMode(pageLayoutId);

  const setIsInitialized = useSetRecoilComponentState(
    pageLayoutIsInitializedComponentState,
    pageLayoutId,
  );

  const { resetDraftPageLayoutToPersistedPageLayout } =
    useResetDraftPageLayoutToPersistedPageLayout(pageLayoutId);

  useEffect(() => {
    return () => {
      resetDraftPageLayoutToPersistedPageLayout();
      setIsPageLayoutInEditMode(false);
      setIsInitialized(false);
    };
  }, [
    resetDraftPageLayoutToPersistedPageLayout,
    setIsPageLayoutInEditMode,
    setIsInitialized,
  ]);

  return null;
};
