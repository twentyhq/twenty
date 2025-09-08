import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';
import {
  savedPageLayoutsState,
  type PageLayoutWidget,
  type SavedPageLayout,
} from '../states/savedPageLayoutsState';

export const usePageLayoutSaveHandler = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';

  const savePageLayout = useRecoilCallback(
    ({ snapshot, set }) =>
      async (widgetsWithPositions?: PageLayoutWidget[]) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const savedPageLayouts = snapshot
          .getLoadable(savedPageLayoutsState)
          .getValue();

        const existingLayout = isEditMode
          ? savedPageLayouts.find((layout) => layout.id === id)
          : undefined;

        const updatedTabs = widgetsWithPositions
          ? pageLayoutDraft.tabs.map((tab) => ({
              ...tab,
              widgets: widgetsWithPositions.filter(
                (w) => w.pageLayoutTabId === tab.id,
              ),
            }))
          : pageLayoutDraft.tabs;

        const layoutToSave: SavedPageLayout = {
          id: isEditMode ? id : uuidv4(),
          name: pageLayoutDraft.name,
          type: pageLayoutDraft.type,
          workspaceId: pageLayoutDraft.workspaceId,
          objectMetadataId: pageLayoutDraft.objectMetadataId,
          tabs: updatedTabs,
          createdAt: isEditMode
            ? (existingLayout?.createdAt ?? new Date().toISOString())
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        set(savedPageLayoutsState, (prev) => {
          if (isDefined(isEditMode)) {
            return prev.map((layout) =>
              layout.id === id ? layoutToSave : layout,
            );
          }
          return [...prev, layoutToSave];
        });

        set(pageLayoutPersistedState, layoutToSave);

        navigate('/settings/page-layout');
      },
    [isEditMode, id, navigate],
  );

  return { savePageLayout };
};
