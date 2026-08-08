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
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { viewableRecordsViewIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsViewIdComponentState';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

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

export const useOpenRecordsInSidePanel = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openRecordsInSidePanel = useCallback(
    ({
      objectNameSingular,
      viewId,
    }: {
      objectNameSingular: string;
      viewId?: string;
    }) => {
      const objectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: objectNameSingular,
          objectNameType: 'singular',
        }),
      );

      if (!isDefined(objectMetadataItem)) {
        throw new Error(
          `Object with singular name ${objectNameSingular} not found, cannot open its records in the side panel.`,
        );
      }

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
        viewableRecordsObjectMetadataIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        objectMetadataItem.id,
      );
      store.set(
        viewableRecordsViewIdComponentState.atomFamily({
          instanceId: pageComponentInstanceId,
        }),
        resolvedView.id,
      );

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
        page: SidePanelPages.ViewRecords,
        pageTitle: resolvedView.name,
        pageIcon: getIcon(resolvedView.icon),
        pageId: pageComponentInstanceId,
      });
    },
    [store, getIcon, navigateSidePanelMenu],
  );

  return { openRecordsInSidePanel };
};
