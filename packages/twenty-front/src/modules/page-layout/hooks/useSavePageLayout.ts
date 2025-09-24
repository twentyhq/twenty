import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/pageLayoutTypes';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useUpdatePageLayoutWithTabsAndWidgetsMutation } from '~/generated/graphql';

export const useSavePageLayout = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutPersistedCallbackState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsCallbackState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const { pageLayoutDraft } = usePageLayoutDraftState(pageLayoutId);

  const [updatePageLayoutWithTabsAndWidgets] =
    useUpdatePageLayoutWithTabsAndWidgetsMutation();

  const savePageLayout = useRecoilCallback(
    ({ set }) =>
      async () => {
        const updateInput =
          convertPageLayoutDraftToUpdateInput(pageLayoutDraft);

        const { data } = await updatePageLayoutWithTabsAndWidgets({
          variables: {
            id: pageLayoutId,
            input: updateInput,
          },
        });

        const updatedPageLayout = data?.updatePageLayoutWithTabsAndWidgets;

        if (isDefined(updatedPageLayout)) {
          const pageLayoutToPersist: PageLayout = {
            id: updatedPageLayout.id,
            name: updatedPageLayout.name,
            type: updatedPageLayout.type,
            objectMetadataId: updatedPageLayout.objectMetadataId,
            tabs:
              updatedPageLayout.tabs?.map((tab) => ({
                id: tab.id,
                title: tab.title,
                position: tab.position,
                pageLayoutId: tab.pageLayoutId,
                createdAt: tab.createdAt,
                updatedAt: tab.updatedAt,
                widgets:
                  tab.widgets?.map((widget) => ({
                    id: widget.id,
                    title: widget.title,
                    type: widget.type,
                    pageLayoutTabId: widget.pageLayoutTabId,
                    objectMetadataId: widget.objectMetadataId,
                    configuration: widget.configuration,
                    gridPosition: widget.gridPosition,
                    createdAt: widget.createdAt,
                    updatedAt: widget.updatedAt,
                  })) ?? [],
              })) ?? [],
            createdAt: updatedPageLayout.createdAt,
            updatedAt: updatedPageLayout.updatedAt,
          };

          set(pageLayoutPersistedCallbackState, pageLayoutToPersist);
          set(
            pageLayoutCurrentLayoutsCallbackState,
            convertPageLayoutToTabLayouts(pageLayoutToPersist),
          );
        }
      },
    [
      pageLayoutCurrentLayoutsCallbackState,
      pageLayoutDraft,
      pageLayoutId,
      pageLayoutPersistedCallbackState,
      updatePageLayoutWithTabsAndWidgets,
    ],
  );

  return { savePageLayout };
};
