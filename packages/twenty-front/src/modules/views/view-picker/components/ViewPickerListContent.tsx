import styled from '@emotion/styled';
import { type DropResult } from '@hello-pangea/dnd';
import { type MouseEvent, useCallback } from 'react';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { usePersistView } from '@/views/hooks/internal/usePersistView';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useOpenCreateViewDropdown } from '@/views/hooks/useOpenCreateViewDropown';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { ViewPickerOptionDropdown } from '@/views/view-picker/components/ViewPickerOptionDropdown';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ViewPickerListContent = () => {
  const { t } = useLingui();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useRecoilValue(
    coreViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const workspaceViews = viewsOnCurrentObject.filter(
    (view) => view.visibility === ViewVisibility.WORKSPACE,
  );

  const unlistedViews = viewsOnCurrentObject.filter(
    (view) => view.visibility === ViewVisibility.UNLISTED,
  );

  const shouldShowSectionLabels =
    workspaceViews.length > 0 && unlistedViews.length > 0;

  const { currentView } = useGetCurrentViewOnly();

  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const { setViewPickerMode } = useViewPickerMode();

  const { updateView } = usePersistView();
  const { changeView } = useChangeView();

  const { closeDropdown } = useCloseDropdown();

  const handleViewSelect = (viewId: string) => {
    changeView(viewId);
    closeDropdown(VIEW_PICKER_DROPDOWN_ID);
  };

  const { openCreateViewDropdown } = useOpenCreateViewDropdown();

  const handleAddViewButtonClick = () => {
    openCreateViewDropdown(currentView);
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setViewPickerReferenceViewId(viewId);
    setViewPickerMode('edit');
  };

  const handleWorkspaceDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const viewsReordered = moveArrayItem(workspaceViews, {
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      });

      Promise.all(
        viewsReordered.map(async (view, index) => {
          if (view.position !== index) {
            await updateView({ id: view.id, input: { position: index } });
          }
        }),
      );
    },
    [updateView, workspaceViews],
  );

  const handleUnlistedDragEnd = useCallback(
    async (result: DropResult) => {
      if (!result.destination) return;

      const viewsReordered = moveArrayItem(unlistedViews, {
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      });

      Promise.all(
        viewsReordered.map(async (view, index) => {
          if (view.position !== index) {
            await updateView({ id: view.id, input: { position: index } });
          }
        }),
      );
    },
    [updateView, unlistedViews],
  );

  return (
    <DropdownContent>
      {workspaceViews.length > 0 && (
        <>
          {shouldShowSectionLabels && (
            <DropdownMenuSectionLabel label={t`Workspace`} />
          )}
          <DropdownMenuItemsContainer hasMaxHeight>
            <DraggableList
              onDragEnd={handleWorkspaceDragEnd}
              draggableItems={workspaceViews.map((view, index) => {
                const isIndexView = view.key === 'INDEX';
                return (
                  <DraggableItem
                    key={view.id}
                    draggableId={view.id}
                    index={index}
                    isDragDisabled={workspaceViews.length === 1}
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
        </>
      )}
      {unlistedViews.length > 0 && (
        <>
          {shouldShowSectionLabels && <DropdownMenuSeparator />}
          {shouldShowSectionLabels && (
            <DropdownMenuSectionLabel label={t`My unlisted views`} />
          )}
          <DropdownMenuItemsContainer hasMaxHeight>
            <DraggableList
              onDragEnd={handleUnlistedDragEnd}
              draggableItems={unlistedViews.map((view, index) => {
                const isIndexView = view.key === 'INDEX';
                return (
                  <DraggableItem
                    key={view.id}
                    draggableId={view.id}
                    index={index}
                    isDragDisabled={unlistedViews.length === 1}
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
        </>
      )}
      <DropdownMenuSeparator />
      <StyledBoldDropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          onClick={handleAddViewButtonClick}
          LeftIcon={IconPlus}
          text={t`Add view`}
        />
      </StyledBoldDropdownMenuItemsContainer>
    </DropdownContent>
  );
};
