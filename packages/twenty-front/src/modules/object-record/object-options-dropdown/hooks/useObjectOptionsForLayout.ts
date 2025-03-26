import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { prefetchViewFromViewIdFamilySelector } from '@/prefetch/states/selector/prefetchViewFromViewIdFamilySelector';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { usePersistViewGroupRecords } from '@/views/hooks/internal/usePersistViewGroupRecords';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { View } from '@/views/types/View';
import { ViewGroup } from '@/views/types/ViewGroup';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { viewPickerKanbanFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerKanbanFieldMetadataIdComponentState';
import { useCallback } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useObjectOptionsForLayout = () => {
  const currentViewId = useRecoilComponentValueV2(
    contextStoreCurrentViewIdComponentState,
  );
  const { updateCurrentView } = useUpdateCurrentView();
  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [, setViewPickerKanbanFieldMetadataId] = useRecoilComponentStateV2(
    viewPickerKanbanFieldMetadataIdComponentState,
  );

  const { createViewGroupRecords } = usePersistViewGroupRecords();

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

      await createViewGroupRecords({
        viewGroupsToCreate,
        viewId: currentViewId,
      });
    },
    [objectMetadataItem, createViewGroupRecords],
  );

  const switchViewType = useCallback(
    async (viewType: ViewType, currentView: View) => {
      const updateCurrentViewParams: Partial<GraphQLView> = {};
      updateCurrentViewParams.type = viewType;

      switch (viewType) {
        case ViewType.Kanban: {
          if (availableFieldsForKanban.length === 0) {
            throw new Error('No fields for kanban - should not happen');
          }
          const previouslySelectedKanbanField = availableFieldsForKanban.find(
            (fieldsForKanban) =>
              fieldsForKanban.id === currentView.kanbanFieldMetadataId,
          );
          if (isDefined(previouslySelectedKanbanField)) {
            const viewGroupExists = currentView.viewGroups.some(
              (viewGroup: ViewGroup) =>
                viewGroup.fieldMetadataId === previouslySelectedKanbanField.id,
            );
            if (!viewGroupExists) {
              throw new Error(
                'View group for kanban field does not exist (was probably deleted) - should not happen',
              );
            }
            setViewPickerKanbanFieldMetadataId(
              previouslySelectedKanbanField.id,
            );
          } else {
            const randomFieldForKanban = availableFieldsForKanban[0];
            updateCurrentViewParams.kanbanFieldMetadataId =
              randomFieldForKanban.id;
            await createViewGroupAssociatedWithKanbanField(
              randomFieldForKanban.id,
              currentView.id,
            );
            setViewPickerKanbanFieldMetadataId(randomFieldForKanban.id);
          }
          break;
        }
        case ViewType.Table:
          break;
        default: {
          return assertUnreachable(viewType);
        }
      }

      setRecordIndexViewType(viewType);
      updateCurrentView(updateCurrentViewParams);
    },
    [
      availableFieldsForKanban,
      updateCurrentView,
      setRecordIndexViewType,
      createViewGroupAssociatedWithKanbanField,
      setViewPickerKanbanFieldMetadataId,
    ],
  );

  const setAndPersistViewType = useRecoilCallback(
    ({ snapshot }) =>
      async (viewType: ViewType) => {
        if (!isDefined(currentViewId)) {
          throw new Error('No view id found');
        }
        const currentView = snapshot
          .getLoadable(
            prefetchViewFromViewIdFamilySelector({ viewId: currentViewId }),
          )
          .getValue();
        if (!isDefined(currentView)) {
          throw new Error('No current view found');
        }

        return await switchViewType(viewType, currentView);
      },
    [currentViewId, switchViewType],
  );

  return {
    setAndPersistViewType,
  };
};
