import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';

import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useObjectOptionsForTable } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForTable';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ViewType } from '@/views/types/ViewType';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconEyeOff, useIcons } from 'twenty-ui/display';
import { MenuItemDraggable } from 'twenty-ui/navigation';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const ViewFieldsVisibleDropdownSection = () => {
  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const {
    handleReorderColumns,
    handleColumnVisibilityChange,
    visibleTableColumns,
  } = useObjectOptionsForTable(recordIndexId, objectMetadataItem.id);

  const {
    handleReorderBoardFields,
    handleBoardFieldVisibilityChange,
    visibleBoardFields,
  } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const visibleRecordFields =
    viewType === ViewType.Kanban ? visibleBoardFields : visibleTableColumns;

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : handleReorderColumns;

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : handleColumnVisibilityChange;

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    handleReorderFields(result, provided);
  };

  const { getIcon } = useIcons();

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const nonDraggableRecordField = visibleRecordFields.find(
    (recordFieldToFilter) =>
      recordFieldToFilter.fieldMetadataId ===
      fieldMetadataItemLabelIdentifier?.id,
  );

  const draggableRecordFields = visibleRecordFields
    .filter(
      (recordFieldToFilter) =>
        recordFieldToFilter.fieldMetadataId !==
        nonDraggableRecordField?.fieldMetadataId,
    )
    .sort(sortByProperty('position'));

  return (
    <>
      <DropdownMenuItemsContainer>
        {fieldMetadataItemLabelIdentifier && (
          <MenuItemDraggable
            LeftIcon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
            text={fieldMetadataItemLabelIdentifier.label}
            accent={'placeholder'}
            showGrip={true}
            isDragDisabled
          />
        )}
        {draggableRecordFields.length > 0 && (
          <DraggableList
            onDragEnd={handleDragEnd}
            draggableItems={
              <>
                {draggableRecordFields.map((recordField, index) => {
                  const fieldIndex =
                    index +
                    (isDefined(fieldMetadataItemLabelIdentifier) ? 1 : 0);

                  const fieldMetadataItem = getFieldMetadataItemById(
                    recordField.fieldMetadataId,
                  );

                  return (
                    <DraggableItem
                      key={recordField.fieldMetadataId}
                      draggableId={recordField.fieldMetadataId}
                      index={fieldIndex + 1}
                      itemComponent={
                        <MenuItemDraggable
                          key={recordField.fieldMetadataId}
                          LeftIcon={getIcon(fieldMetadataItem.icon)}
                          iconButtons={[
                            {
                              Icon: IconEyeOff,
                              onClick: () =>
                                handleChangeFieldVisibility({
                                  fieldMetadataId: recordField.fieldMetadataId,
                                  isVisible: recordField.isVisible,
                                }),
                            },
                          ]}
                          text={fieldMetadataItem.label}
                          showGrip
                        />
                      }
                    />
                  );
                })}
              </>
            }
          />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
