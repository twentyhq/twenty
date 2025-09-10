import { useRecoilState, useRecoilValue } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';

export const usePageLayoutDraftState = () => {
  const [pageLayoutDraft, setPageLayoutDraft] =
    useRecoilState(pageLayoutDraftState);
  const pageLayoutPersisted = useRecoilValue(pageLayoutPersistedState);

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
