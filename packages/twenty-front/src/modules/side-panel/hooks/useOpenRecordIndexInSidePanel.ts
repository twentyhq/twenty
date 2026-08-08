import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ContextStorePageType, SidePanelPages } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
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
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

// Unlike getViewType, which folds calendar views into the table context for
// the main page, the artifact context describes the layout as rendered;
// calendar artifacts then send no browsing context. Widget variants cannot
// be resolved from the user-facing view pool below, but map to the layout
// they would render as so the mapping stays exhaustive.
const getArtifactContextStoreViewType = (viewType: ViewType) => {
  switch (viewType) {
    case ViewType.TABLE:
    case ViewType.TABLE_WIDGET:
    case ViewType.LIST:
    case ViewType.FIELDS_WIDGET:
      return ContextStoreViewType.Table;
    case ViewType.KANBAN:
    case ViewType.KANBAN_WIDGET:
      return ContextStoreViewType.Kanban;
    case ViewType.CALENDAR:
    case ViewType.CALENDAR_WIDGET:
      return ContextStoreViewType.Calendar;
    default:
      return assertUnreachable(viewType);
  }
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

      // User-facing views only, sorted by position; a view id that is
      // unknown or points at a widget-backing view falls back to the
      // object's index view.
      const objectViews = store.get(
        viewsFromObjectMetadataItemFamilySelector.selectorFamily({
          objectMetadataItemId: objectMetadataItem.id,
        }),
      );

      const resolvedView =
        objectViews.find((view) => view.id === viewId) ??
        objectViews.find((view) => view.key === ViewKey.INDEX) ??
        objectViews[0];

      if (!isDefined(resolvedView)) {
        throw new Error(
          `No view found for object ${objectNameSingular}, cannot open its records in the side panel.`,
        );
      }

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
        resolvedView.id,
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
        resolvedView.id,
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
        getArtifactContextStoreViewType(resolvedView.type),
      );

      navigateSidePanelMenu({
        page: SidePanelPages.ViewRecordIndex,
        pageTitle: resolvedView.name,
        pageIcon: getIcon(resolvedView.icon),
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openRecordIndexInSidePanel };
};
