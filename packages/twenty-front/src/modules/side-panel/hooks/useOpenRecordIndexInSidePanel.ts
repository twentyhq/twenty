import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ContextStorePageType, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { getObjectMetadataItemBySingularNameOrThrow } from '@/object-metadata/utils/getObjectMetadataItemBySingularNameOrThrow';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRecordIndexObjectMetadataIdComponentState } from '@/side-panel/pages/record-index-page/states/viewableRecordIndexObjectMetadataIdComponentState';
import { viewableRecordIndexViewIdComponentState } from '@/side-panel/pages/record-index-page/states/viewableRecordIndexViewIdComponentState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

// Unlike getViewType, which folds calendar views into the table context for
// the main page, the artifact context describes the layout as rendered;
// calendar artifacts then send no browsing context.
const getArtifactContextStoreViewType = (viewType?: ViewType) => {
  if (viewType === ViewType.KANBAN) {
    return ContextStoreViewType.Kanban;
  }

  if (viewType === ViewType.CALENDAR) {
    return ContextStoreViewType.Calendar;
  }

  return ContextStoreViewType.Table;
};

export const useOpenRecordIndexInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openRecordIndexInSidePanel = useCallback(
    ({
      objectNameSingular,
      viewId,
    }: {
      objectNameSingular: string;
      viewId?: string;
    }) => {
      const objectMetadataItem = getObjectMetadataItemBySingularNameOrThrow({
        store,
        objectNameSingular,
      });

      const views = store.get(viewsSelector.atom);
      const objectViews = views.filter(
        (view) =>
          view.objectMetadataId === objectMetadataItem.id &&
          view.type !== ViewType.FIELDS_WIDGET,
      );

      const resolvedViewId =
        viewId ??
        objectViews.find((view) => view.key === ViewKey.INDEX)?.id ??
        objectViews[0]?.id;

      if (!isDefined(resolvedViewId)) {
        throw new Error(
          `No view found for object ${objectNameSingular}, cannot open its records in the side panel.`,
        );
      }

      const view = views.find(
        (candidateView) => candidateView.id === resolvedViewId,
      );

      const pageComponentInstanceId = v4();

      store.set(
        viewableRecordIndexObjectMetadataIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectMetadataItem.id,
      );
      store.set(
        viewableRecordIndexViewIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        resolvedViewId,
      );

      // Artifact pages publish their browsing context under their own page
      // instance id, so the chat receives the artifact as its context.
      store.set(
        contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectMetadataItem.id,
      );
      store.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        resolvedViewId,
      );
      store.set(
        contextStoreCurrentPageTypeComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        ContextStorePageType.Index,
      );
      store.set(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        getArtifactContextStoreViewType(view?.type),
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ViewRecordIndex,
        pageTitle: view?.name ?? objectMetadataItem.labelPlural,
        pageIcon: getIcon(view?.icon ?? objectMetadataItem.icon ?? 'IconList'),
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openRecordIndexInSidePanel };
};
