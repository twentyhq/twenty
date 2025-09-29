import { usePageLayoutDraftState } from '@/page-layout/hooks/usePageLayoutDraftState';
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
          const pageLayoutToPersist: PageLayout =
            transformPageLayout(updatedPageLayout);

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
