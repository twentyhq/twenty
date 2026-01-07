import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';

export const usePageLayoutDraftState = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const [pageLayoutDraft, setPageLayoutDraft] = useRecoilComponentState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );
  const pageLayoutPersisted = useRecoilComponentValue(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const isDirty = pageLayoutPersisted
    ? !isDeeplyEqual(pageLayoutDraft, {
        id: pageLayoutPersisted.id,
        name: pageLayoutPersisted.name,
        type: pageLayoutPersisted.type,
        objectMetadataId: pageLayoutPersisted.objectMetadataId,
        tabs: pageLayoutPersisted.tabs,
      })
    : pageLayoutDraft.name.trim().length > 0 || pageLayoutDraft.tabs.length > 0;

  const canSave = pageLayoutDraft.name?.trim().length > 0;

  return {
    pageLayoutDraft,
    setPageLayoutDraft,
    isDirty,
    canSave,
  };
};
