import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';
import {
  savedPageLayoutsState,
  type SavedPageLayout,
} from '../states/savedPageLayoutsState';

type WidgetWithGridPosition = SavedPageLayout['widgets'][0];

export const usePageLayoutSaveHandler = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';
  const [savedPageLayouts, setSavedPageLayouts] = useRecoilState(
    savedPageLayoutsState,
  );
  const pageLayoutDraft = useRecoilValue(pageLayoutDraftState);
  const setPageLayoutPersisted = useSetRecoilState(pageLayoutPersistedState);

  const existingLayout = isEditMode
    ? savedPageLayouts.find((layout) => layout.id === id)
    : undefined;

  const savePageLayout = useCallback(
    async (widgetsWithPositions?: WidgetWithGridPosition[]) => {
      const widgets = widgetsWithPositions || pageLayoutDraft.widgets;

      const layoutToSave: SavedPageLayout = {
        id: isEditMode ? id : uuidv4(),
        name: pageLayoutDraft.name,
        type: pageLayoutDraft.type,
        createdAt: isEditMode
          ? existingLayout?.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets,
      };

      setSavedPageLayouts((prev) => {
        if (isDefined(isEditMode)) {
          return prev.map((layout) =>
            layout.id === id ? layoutToSave : layout,
          );
        }
        return [...prev, layoutToSave];
      });

      setPageLayoutPersisted(layoutToSave);

      navigate('/settings/page-layout');
    },
    [
      isEditMode,
      id,
      existingLayout?.createdAt,
      pageLayoutDraft,
      setSavedPageLayouts,
      setPageLayoutPersisted,
      navigate,
    ],
  );

  return { savePageLayout };
};
