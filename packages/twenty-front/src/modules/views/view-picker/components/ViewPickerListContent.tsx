import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { IconPlus, MenuItem } from 'twenty-ui';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { ViewPickerOptionDropdown } from '@/views/view-picker/components/ViewPickerOptionDropdown';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilRefresher_UNSTABLE, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ViewPickerListContent = () => {
  const { t } = useLingui();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useRecoilValue(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const refreshViews = useRecoilRefresher_UNSTABLE(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { currentView } = useGetCurrentViewOnly();

  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const { setViewPickerMode } = useViewPickerMode();

  const { updateView } = useUpdateView();
  const { changeView } = useChangeView();

  const { closeDropdown } = useDropdown(VIEW_PICKER_DROPDOWN_ID);

  const handleViewSelect = (viewId: string) => {
    changeView(viewId);
    closeDropdown();
  };

  const handleAddViewButtonClick = () => {
    if (isDefined(currentView?.id)) {
      setViewPickerReferenceViewId(currentView.id);
      setViewPickerMode('create-empty');
      refreshViews();
    }
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setViewPickerReferenceViewId(viewId);
    setViewPickerMode('edit');
  };

  const [localViews, setLocalViews] = useState<typeof viewsOnCurrentObject>([]);

  useEffect(() => {
    const sortedViews = [...viewsOnCurrentObject].sort(
      (a, b) => a.position - b.position,
    );
    setLocalViews(sortedViews);
  }, [viewsOnCurrentObject]);

  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      if (
        !result.destination ||
        result.source.index === result.destination.index
      )
        return;

      const newViews = [...localViews];
      const [movedView] = newViews.splice(result.source.index, 1);
      newViews.splice(result.destination.index, 0, movedView);

      const updatedViews = newViews.map((view, index) => ({
        ...view,
        position: index,
      }));

      setLocalViews(updatedViews);

      try {
        await Promise.all(
          updatedViews.map((view) =>
            updateView({
              id: view.id,
              position: view.position,
            }),
          ),
        );
        refreshViews();
      } catch (error) {
        setLocalViews(
          [...viewsOnCurrentObject].sort((a, b) => a.position - b.position),
        );
      }
    },
    [localViews, viewsOnCurrentObject, updateView, refreshViews],
  );

  return (
    <>
      <DropdownMenuItemsContainer>
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={localViews.map((view, index) => {
            const isIndexView = view.key === 'INDEX';
            return (
              <DraggableItem
                key={view.id}
                draggableId={view.id}
                index={index}
                isDragDisabled={viewsOnCurrentObject.length === 1}
                itemComponent={
                  <ViewPickerOptionDropdown
                    view={{ ...view, __typename: 'View' }}
                    handleViewSelect={handleViewSelect}
                    isIndexView={isIndexView}
                    onEdit={handleEditViewButtonClick}
                  />
                }
              />
            );
          })}
        />
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <StyledBoldDropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          onClick={handleAddViewButtonClick}
          LeftIcon={IconPlus}
          text={t`Add view`}
        />
      </StyledBoldDropdownMenuItemsContainer>
    </>
  );
};
