import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '../states/pageLayoutPersistedComponentState';

export const usePageLayoutDraftState = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const [pageLayoutDraft, setPageLayoutDraft] = useRecoilComponentState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );
  const pageLayoutPersisted = useRecoilComponentValue(
    pageLayoutPersistedComponentState,
    pageLayoutInstanceId,
  );

  const isDirty = pageLayoutPersisted
    ? !isDeeplyEqual(pageLayoutDraft, {
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
