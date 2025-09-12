import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/pageLayoutEditModeComponentState';
import { savedPageLayoutsComponentState } from '@/page-layout/states/savedPageLayoutsComponentState';
import {
  type PageLayoutWidgetWithData,
  type PageLayoutWithData,
} from '@/page-layout/types/pageLayoutTypes';
import { getPageLayoutIdInstanceIdFromPageLayoutId } from '@/page-layout/utils/getPageLayoutIdInstanceIdFromPageLayoutId';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { id } from 'date-fns/locale';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';
import { pageLayoutDraftComponentState } from '../states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '../states/pageLayoutPersistedComponentState';

export const usePageLayoutSaveHandler = (pageLayoutId: string) => {
  const pageLayoutInstanceId =
    getPageLayoutIdInstanceIdFromPageLayoutId(pageLayoutId);

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutInstanceId,
  );

  const pageLayoutPersistedState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutInstanceId,
  );

  const savedPageLayoutsState = useRecoilComponentCallbackState(
    savedPageLayoutsComponentState,
    pageLayoutInstanceId,
  );

  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutInstanceId,
  );

  const savePageLayout = useRecoilCallback(
    ({ snapshot, set }) =>
      async (widgetsWithPositions?: PageLayoutWidgetWithData[]) => {
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();
        const savedPageLayouts = snapshot
          .getLoadable(savedPageLayoutsState)
          .getValue();

        const isPageLayoutInEditMode = snapshot
          .getLoadable(isPageLayoutInEditModeState)
          .getValue();

        const existingLayout = isPageLayoutInEditMode
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
          id: isPageLayoutInEditMode ? id : uuidv4(),
          name: pageLayoutDraft.name,
          type: pageLayoutDraft.type,
          objectMetadataId: pageLayoutDraft.objectMetadataId,
          tabs: updatedTabs,
          createdAt: isPageLayoutInEditMode
            ? (existingLayout?.createdAt ?? new Date().toISOString())
            : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        };

        set(savedPageLayoutsState, (prev) => {
          if (isDefined(isPageLayoutInEditMode)) {
            return prev.map((layout) =>
              layout.id === id ? layoutToSave : layout,
            );
          }
          return [...prev, layoutToSave];
        });

        set(pageLayoutPersistedState, layoutToSave);
      },
    [
      pageLayoutDraftState,
      savedPageLayoutsState,
      isPageLayoutInEditModeState,
      pageLayoutPersistedState,
    ],
  );

  return { savePageLayout };
};
