import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

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

  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();

  const savePageLayout = useRecoilCallback(
    ({ set }) =>
      async () => {
        const updateInput =
          convertPageLayoutDraftToUpdateInput(pageLayoutDraft);

        const result = await updatePageLayoutWithTabsAndWidgets(
          pageLayoutId,
          updateInput,
        );

        if (result.status === 'successful') {
          const updatedPageLayout =
            result.response.data?.updatePageLayoutWithTabsAndWidgets;

          if (isDefined(updatedPageLayout)) {
            const pageLayoutToPersist: PageLayout =
              transformPageLayout(updatedPageLayout);

            set(pageLayoutPersistedCallbackState, pageLayoutToPersist);
            set(
              pageLayoutCurrentLayoutsCallbackState,
              convertPageLayoutToTabLayouts(pageLayoutToPersist),
            );
          }
        }

        return result;
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
