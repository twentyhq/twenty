import { savedPageLayoutsState } from '@/page-layout/states/savedPageLayoutsState';
import {
  type PageLayoutWidgetWithData,
  type PageLayoutWithData,
} from '@/page-layout/types/pageLayoutTypes';
import { useParams } from 'react-router-dom';
import { useRecoilCallback } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutPersistedState } from '../states/pageLayoutPersistedState';

export const usePageLayoutSaveHandler = () => {
  const navigateSettings = useNavigateSettings();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id && id !== 'new';

  const savePageLayout = useRecoilCallback(
    ({ snapshot, set }) =>
      async (widgetsWithPositions?: PageLayoutWidgetWithData[]) => {
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

        const layoutToSave: PageLayoutWithData = {
          id: isEditMode ? id : uuidv4(),
          name: pageLayoutDraft.name,
          type: pageLayoutDraft.type,
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

        navigateSettings(SettingsPath.PageLayout);
      },
    [isEditMode, id, navigateSettings],
  );

  return { savePageLayout };
};
