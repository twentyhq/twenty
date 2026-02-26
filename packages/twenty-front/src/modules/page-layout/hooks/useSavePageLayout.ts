import { useUpdatePageLayoutWithTabsAndWidgets } from '@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutDraftToUpdateInput } from '@/page-layout/utils/convertPageLayoutDraftToUpdateInput';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { reInjectDynamicRelationWidgetsFromDraft } from '@/page-layout/utils/reInjectDynamicRelationWidgetsFromDraft';
import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useSavePageLayout = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutPersistedCallbackState = useAtomComponentStateCallbackState(
    pageLayoutPersistedComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsCallbackState =
    useAtomComponentStateCallbackState(
      pageLayoutCurrentLayoutsComponentState,
      pageLayoutId,
    );

  const pageLayoutDraftCallbackState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const { updatePageLayoutWithTabsAndWidgets } =
    useUpdatePageLayoutWithTabsAndWidgets();

  const store = useStore();

  const savePageLayout = useCallback(async () => {
    const pageLayoutDraft = store.get(pageLayoutDraftCallbackState);
    const updateInput = convertPageLayoutDraftToUpdateInput(pageLayoutDraft);

    const result = await updatePageLayoutWithTabsAndWidgets(
      pageLayoutId,
      updateInput,
    );

    if (result.status === 'successful') {
      const updatedPageLayout =
        result.response.data?.updatePageLayoutWithTabsAndWidgets;

      if (isDefined(updatedPageLayout)) {
        const serverLayout: PageLayout = transformPageLayout(updatedPageLayout);

        const pageLayoutToPersist =
          serverLayout.type === PageLayoutType.RECORD_PAGE
            ? reInjectDynamicRelationWidgetsFromDraft(
                serverLayout,
                pageLayoutDraft,
              )
            : serverLayout;

        store.set(pageLayoutPersistedCallbackState, pageLayoutToPersist);
        store.set(
          pageLayoutCurrentLayoutsCallbackState,
          convertPageLayoutToTabLayouts(pageLayoutToPersist),
        );
      }
    }

    return result;
  }, [
    pageLayoutCurrentLayoutsCallbackState,
    pageLayoutDraftCallbackState,
    pageLayoutId,
    pageLayoutPersistedCallbackState,
    updatePageLayoutWithTabsAndWidgets,
    store,
  ]);

  return { savePageLayout };
};
