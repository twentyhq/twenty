import { type DropResult, type ResponderProvided } from '@hello-pangea/dnd';

import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useProcessOptionDropdownDragEnd } from '@/object-record/object-options-dropdown/hooks/useProcessOptionDropdownDragEnd';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { dropdownYPositionComponentState } from '@/ui/layout/dropdown/states/internal/dropdownYPositionComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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

  const { processOptionDropdownDragEnd } =
    useProcessOptionDropdownDragEnd(recordIndexId);

  const { handleReorderBoardFields, handleBoardFieldVisibilityChange } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const handleReorderFields =
    viewType === ViewType.Kanban
      ? handleReorderBoardFields
      : processOptionDropdownDragEnd;

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const handleChangeFieldVisibility =
    viewType === ViewType.Kanban
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const handleDragEnd = (result: DropResult, provided: ResponderProvided) => {
    handleReorderFields(result, provided);
  };

  const { getIcon } = useIcons();

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const nonDraggableRecordField = visibleRecordFields.find(
    (recordFieldToFilter) =>
      recordFieldToFilter.fieldMetadataItemId ===
      fieldMetadataItemLabelIdentifier?.id,
  );

  const draggableRecordFields = visibleRecordFields
    .filter(
      (recordFieldToFilter) =>
        nonDraggableRecordField?.fieldMetadataItemId !==
        recordFieldToFilter.fieldMetadataItemId,
    )
    .toSorted(sortByProperty('position'));

  const dropdownYPosition = useRecoilComponentValue(
    dropdownYPositionComponentState,
  );

  return (
    <>
      <DropdownMenuItemsContainer>
        {fieldMetadataItemLabelIdentifier && (
          <MenuItemDraggable
            LeftIcon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
            text={fieldMetadataItemLabelIdentifier.label}
            accent="placeholder"
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

                  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
                    recordField.fieldMetadataItemId,
                  );

                  return (
                    <DraggableItem
                      key={recordField.fieldMetadataItemId}
                      draggableId={recordField.fieldMetadataItemId}
                      index={fieldIndex + 1}
                      isInsideScrollableContainer
                      containerOffsetY={dropdownYPosition}
                      itemComponent={
                        <MenuItemDraggable
                          key={recordField.fieldMetadataItemId}
                          LeftIcon={getIcon(fieldMetadataItem.icon)}
                          iconButtons={[
                            {
                              Icon: IconEyeOff,
                              onClick: () => {
                                handleChangeFieldVisibility({
                                  fieldMetadataId:
                                    recordField.fieldMetadataItemId,
                                  isVisible: false,
                                });
                              },
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
