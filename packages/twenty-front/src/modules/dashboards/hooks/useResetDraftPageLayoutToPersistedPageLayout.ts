import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useResetDraftPageLayoutToPersistedPageLayout = (
  pageLayoutIdFromProps?: string,
) => {
  const componentInstanceId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutDraftState = useRecoilComponentCallbackState(
    pageLayoutDraftComponentState,
    componentInstanceId,
  );

  const pageLayoutPersistedState = useRecoilComponentCallbackState(
    pageLayoutPersistedComponentState,
    componentInstanceId,
  );

  const pageLayoutCurrentLayoutsState = useRecoilComponentCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    componentInstanceId,
  );

  const resetDraftPageLayoutToPersistedPageLayout = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const pageLayoutPersisted = snapshot
          .getLoadable(pageLayoutPersistedState)
          .getValue();

        if (isDefined(pageLayoutPersisted)) {
          set(pageLayoutDraftState, {
            id: pageLayoutPersisted.id,
            name: pageLayoutPersisted.name,
            type: pageLayoutPersisted.type,
            objectMetadataId: pageLayoutPersisted.objectMetadataId,
            tabs: pageLayoutPersisted.tabs,
          });

          const tabLayouts = convertPageLayoutToTabLayouts(pageLayoutPersisted);
          set(pageLayoutCurrentLayoutsState, tabLayouts);
        }
      },
    [
      pageLayoutDraftState,
      pageLayoutPersistedState,
      pageLayoutCurrentLayoutsState,
    ],
  );

  return {
    resetDraftPageLayoutToPersistedPageLayout,
  };
};
