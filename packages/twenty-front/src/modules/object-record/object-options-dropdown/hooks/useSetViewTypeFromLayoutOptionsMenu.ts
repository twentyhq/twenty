import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsToGroupRecordsBy } from '@/views/view-picker/hooks/useGetAvailableFieldsToGroupRecordsBy';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

export const useSetViewTypeFromLayoutOptionsMenu = () => {
  const { updateCurrentView } = useUpdateCurrentView();
  const setRecordIndexViewType = useSetAtomState(recordIndexViewTypeState);
  const { availableFieldsForGrouping } =
    useGetAvailableFieldsToGroupRecordsBy();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();

  const store = useStore();

  const setAndPersistViewType = useCallback(
    async (viewType: ViewType) => {
      const currentViewId = store.get(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
      );

      const existingViews = store.get(viewsSelector.atom);

      if (!isDefined(currentViewId)) {
        throw new Error('No view id found');
      }

      const currentView = existingViews.find(
        (view) => view.id === currentViewId,
      );

      if (!isDefined(currentView)) {
        throw new Error('No current view found');
      }

      const updateCurrentViewParams: Partial<GraphQLView> = {};
      updateCurrentViewParams.type = viewType;

      switch (viewType) {
        case ViewType.KANBAN: {
          if (availableFieldsForGrouping.length === 0) {
            throw new Error('No fields for kanban - should not happen');
          }

          const mainGroupByFieldMetadataId = availableFieldsForGrouping[0].id;
          updateCurrentViewParams.mainGroupByFieldMetadataId =
            mainGroupByFieldMetadataId;

          if (shouldChangeIcon(currentView.icon, currentView.type)) {
            updateCurrentViewParams.icon =
              viewTypeIconMapping(viewType).displayName;
          }

          setRecordIndexViewType(viewType);
          await updateCurrentView(updateCurrentViewParams);
          return;
        }
        case ViewType.TABLE: {
          if (shouldChangeIcon(currentView.icon, currentView.type)) {
            updateCurrentViewParams.icon =
              viewTypeIconMapping(viewType).displayName;
          }
          updateCurrentViewParams.mainGroupByFieldMetadataId = null;
          await updateCurrentView(updateCurrentViewParams);
          setRecordIndexViewType(viewType);
          return;
        }
        case ViewType.CALENDAR: {
          if (availableFieldsForCalendar.length === 0) {
            throw new Error('No date fields for calendar');
          }

          const calendarFieldMetadataId = availableFieldsForCalendar[0].id;

          setRecordIndexViewType(viewType);

          loadRecordIndexStates(
            {
              ...currentView,
              type: viewType,
              calendarFieldMetadataId,
              calendarLayout: ViewCalendarLayout.MONTH,
            },
            objectMetadataItem,
          );

          if (shouldChangeIcon(currentView.icon, currentView.type)) {
            updateCurrentViewParams.icon =
              viewTypeIconMapping(viewType).displayName;
          }
          updateCurrentViewParams.calendarLayout = ViewCalendarLayout.MONTH;
          updateCurrentViewParams.calendarFieldMetadataId =
            calendarFieldMetadataId;
          updateCurrentViewParams.mainGroupByFieldMetadataId = null;
          return await updateCurrentView(updateCurrentViewParams);
        }
        case ViewType.TABLE_WIDGET:
        case ViewType.FIELDS_WIDGET: {
          return;
        }
        default: {
          return assertUnreachable(viewType);
        }
      }
    },
    [
      availableFieldsForGrouping,
      setRecordIndexViewType,
      store,
      updateCurrentView,
      availableFieldsForCalendar,
      loadRecordIndexStates,
      objectMetadataItem,
    ],
  );

  const shouldChangeIcon = (
    oldIcon: string,
    oldViewType: ViewType,
  ): boolean => {
    if (
      oldViewType === ViewType.KANBAN &&
      oldIcon === viewTypeIconMapping(ViewType.KANBAN).displayName
    ) {
      return true;
    }
    if (
      oldViewType === ViewType.TABLE &&
      oldIcon === viewTypeIconMapping(ViewType.TABLE).displayName
    ) {
      return true;
    }
    if (
      oldViewType === ViewType.CALENDAR &&
      oldIcon === viewTypeIconMapping(ViewType.CALENDAR).displayName
    ) {
      return true;
    }
    return false;
  };

  return {
    setAndPersistViewType,
  };
};
