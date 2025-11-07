import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';

import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroup';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { coreViewsState } from '@/views/states/coreViewState';
import { type GraphQLView } from '@/views/types/GraphQLView';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { convertViewTypeToCore } from '@/views/utils/convertViewTypeToCore';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useCallback } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { ViewCalendarLayout } from '~/generated/graphql';

export const useSetViewTypeFromLayoutOptionsMenu = () => {
  const { updateCurrentView } = useUpdateCurrentView();
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { loadRecordIndexStates } = useLoadRecordIndexStates();

  const { createViewGroups } = usePersistViewGroupRecords();

  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();

  const createViewGroupAssociatedWithKanbanField = useCallback(
    async (randomFieldForKanban: string, currentViewId: string) => {
      const viewGroupsToCreate =
        objectMetadataItem.fields
          ?.find((field) => field.id === randomFieldForKanban)
          ?.options?.map(
            (option, index) =>
              ({
                id: v4(),
                __typename: 'ViewGroup',
                fieldMetadataId: randomFieldForKanban,
                fieldValue: option.value,
                isVisible: true,
                position: index,
              }) satisfies ViewGroup,
          ) ?? [];

      viewGroupsToCreate.push({
        __typename: 'ViewGroup',
        id: v4(),
        fieldValue: '',
        position: viewGroupsToCreate.length,
        isVisible: true,
        fieldMetadataId: randomFieldForKanban,
      } satisfies ViewGroup);

      await createViewGroups({
        inputs: viewGroupsToCreate.map(({ __typename, ...viewGroup }) => ({
          ...viewGroup,
          viewId: currentViewId,
        })),
      });

      return viewGroupsToCreate;
    },
    [objectMetadataItem, createViewGroups],
  );

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

            if (currentView.viewGroups.length === 0) {
              const viewGroups = await createViewGroupAssociatedWithKanbanField(
                availableFieldsForKanban[0].id,
                currentView.id,
              );
              loadRecordIndexStates(
                { ...currentView, viewGroups },
                objectMetadataItem,
              );
            }
            setRecordIndexViewType(viewType);
            set(coreViewsState, [
              ...existingCoreViews.filter(
                (coreView) => coreView.id !== currentView.id,
              ),
              {
                ...currentCoreView,
                type: convertViewTypeToCore(viewType),
              },
            ]);

            if (shouldChangeIcon(currentView.icon, currentView.type)) {
              updateCurrentViewParams.icon =
                viewTypeIconMapping(viewType).displayName;
            }
            return await updateCurrentView(updateCurrentViewParams);
          }
          case ViewType.Table: {
            setRecordIndexViewType(viewType);
            set(coreViewsState, [
              ...existingCoreViews.filter(
                (coreView) => coreView.id !== currentView.id,
              ),
              {
                ...currentCoreView,
                type: convertViewTypeToCore(viewType),
              },
            ]);

            if (shouldChangeIcon(currentView.icon, currentView.type)) {
              updateCurrentViewParams.icon =
                viewTypeIconMapping(viewType).displayName;
            }
            return await updateCurrentView(updateCurrentViewParams);
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
            return await updateCurrentView(updateCurrentViewParams);
          }
          default: {
            return assertUnreachable(viewType);
          }
        }
      },
    [
      availableFieldsForKanban,
      objectMetadataItem,
      updateCurrentView,
      setRecordIndexViewType,
      createViewGroupAssociatedWithKanbanField,
      loadRecordIndexStates,
      availableFieldsForCalendar,
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
