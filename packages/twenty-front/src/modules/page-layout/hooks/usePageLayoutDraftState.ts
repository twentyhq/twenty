import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const usePageLayoutDraftState = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const [pageLayoutDraft, setPageLayoutDraft] = useAtomComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const isDirty = pageLayoutPersisted
    ? !isDeeplyEqual(pageLayoutDraft, toDraftPageLayout(pageLayoutPersisted))
    : pageLayoutDraft.name.trim().length > 0 || pageLayoutDraft.tabs.length > 0;

  const canSave = pageLayoutDraft.name?.trim().length > 0;

  return {
    pageLayoutDraft,
    setPageLayoutDraft,
    isDirty,
    canSave,
  };
};
