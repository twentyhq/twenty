import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { coreViewsState } from '@/views/states/coreViewState';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { ViewCalendarLayout } from '~/generated/graphql';

export const useSetViewTypeFromLayoutOptionsMenu = () => {
  const { updateCurrentView } = useUpdateCurrentView();
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();

  const setAndPersistViewType = useRecoilCallback(
    ({ snapshot, set }) =>
      async (viewType: ViewType) => {
        const currentViewId = snapshot
          .getLoadable(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
            }),
          )
          .getValue();

        const existingCoreViews = snapshot
          .getLoadable(coreViewsState)
          .getValue();

        if (!isDefined(currentViewId)) {
          throw new Error('No view id found');
        }

        const currentCoreView = existingCoreViews.find(
          (coreView) => coreView.id === currentViewId,
        );

        if (!isDefined(currentCoreView)) {
          throw new Error('No current view found');
        }

        const currentView = convertCoreViewToView(currentCoreView);

        const updateCurrentViewParams: Partial<GraphQLView> = {};
        updateCurrentViewParams.type = viewType;

        switch (viewType) {
          case ViewType.Kanban: {
            if (availableFieldsForKanban.length === 0) {
              throw new Error('No fields for kanban - should not happen');
            }

            const mainGroupByFieldMetadataId = availableFieldsForKanban[0].id;
            updateCurrentViewParams.mainGroupByFieldMetadataId =
              mainGroupByFieldMetadataId;

            if (shouldChangeIcon(currentView.icon, currentView.type)) {
              updateCurrentViewParams.icon =
                viewTypeIconMapping(viewType).displayName;
            }

            setRecordIndexViewType(viewType);
            set(coreViewsState, [
              ...existingCoreViews.filter(
                (coreView) => coreView.id !== currentView.id,
              ),
              {
                ...currentCoreView,
                type: convertViewTypeToCore(viewType),
                mainGroupByFieldMetadataId,
              },
            ]);
            await updateCurrentView(updateCurrentViewParams);
            return;
          }
          case ViewType.Table: {
            if (shouldChangeIcon(currentView.icon, currentView.type)) {
              updateCurrentViewParams.icon =
                viewTypeIconMapping(viewType).displayName;
            }
            updateCurrentViewParams.mainGroupByFieldMetadataId = null;
            await updateCurrentView(updateCurrentViewParams);
            setRecordIndexViewType(viewType);
            set(coreViewsState, [
              ...existingCoreViews.filter(
                (coreView) => coreView.id !== currentView.id,
              ),
              {
                ...currentCoreView,
                mainGroupByFieldMetadataId: null,
                type: convertViewTypeToCore(viewType),
              },
            ]);
            return;
          }
          case ViewType.Calendar: {
            if (availableFieldsForCalendar.length === 0) {
              throw new Error('No date fields for calendar');
            }

            const calendarFieldMetadataId = availableFieldsForCalendar[0].id;

            setRecordIndexViewType(viewType);
            set(coreViewsState, [
              ...existingCoreViews.filter(
                (coreView) => coreView.id !== currentView.id,
              ),
              {
                ...currentCoreView,
                mainGroupByFieldMetadataId: null,
                type: convertViewTypeToCore(viewType),
                calendarLayout: ViewCalendarLayout.MONTH,
                calendarFieldMetadataId,
              },
            ]);

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
          default: {
            return assertUnreachable(viewType);
          }
        }
      },
    [
      availableFieldsForKanban,
      setRecordIndexViewType,
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
      oldViewType === ViewType.Kanban &&
      oldIcon === viewTypeIconMapping(ViewType.Kanban).displayName
    ) {
      return true;
    }
    if (
      oldViewType === ViewType.Table &&
      oldIcon === viewTypeIconMapping(ViewType.Table).displayName
    ) {
      return true;
    }
    if (
      oldViewType === ViewType.Calendar &&
      oldIcon === viewTypeIconMapping(ViewType.Calendar).displayName
    ) {
      return true;
    }
    return false;
  };

  return {
    setAndPersistViewType,
  };
};
