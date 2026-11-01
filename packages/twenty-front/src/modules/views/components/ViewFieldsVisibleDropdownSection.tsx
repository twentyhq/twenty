import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useProcessOptionDropdownDragEnd } from '@/object-record/object-options-dropdown/hooks/useProcessOptionDropdownDragEnd';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { ViewType } from '@/views/types/ViewType';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEyeOff, useIcons } from 'twenty-ui/icon';
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
    viewType === ViewType.KANBAN
      ? handleReorderBoardFields
      : processOptionDropdownDragEnd;

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const handleChangeFieldVisibility =
    viewType === ViewType.KANBAN
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const { getIcon } = useIcons();

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const visibleRecordFields = useAtomComponentSelectorValue(
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

  const handleDragEnd = (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    handleReorderFields({
      recordFieldToMove: draggableRecordFields[result.source.index],
      targetRecordField: draggableRecordFields[result.destination.index],
    });
  };

  return (
    <>
      <DropdownMenuItemsContainer>
        {fieldMetadataItemLabelIdentifier && (
          <DraggableListRow
            startIcon={
              <ApplicationStackIcon
                Icon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
                applicationId={fieldMetadataItemLabelIdentifier.applicationId}
              />
            }
            isMuted
            dragHandleVisibility="always"
            isDragDisabled
          >
            {fieldMetadataItemLabelIdentifier.label}
          </DraggableListRow>
        )}
        {draggableRecordFields.length > 0 && (
          <DraggableList
            onDragEnd={handleDragEnd}
            draggableItems={
              <>
                {draggableRecordFields.map((recordField, index) => {
                  const { fieldMetadataItem } = getFieldMetadataItemByIdOrThrow(
                    recordField.fieldMetadataItemId,
                  );

                  return (
                    <DraggableItem
                      key={recordField.fieldMetadataItemId}
                      draggableId={recordField.fieldMetadataItemId}
                      index={index}
                      itemComponent={
                        <DraggableListRow
                          key={recordField.fieldMetadataItemId}
                          startIcon={
                            <ApplicationStackIcon
                              Icon={getIcon(fieldMetadataItem.icon)}
                              applicationId={fieldMetadataItem.applicationId}
                            />
                          }
                          actions={
                            <LightIconButton
                              aria-label={t`Hide field`}
                              onClick={() => {
                                handleChangeFieldVisibility({
                                  fieldMetadataId:
                                    recordField.fieldMetadataItemId,
                                  isVisible: false,
                                });
                              }}
                            >
                              <IconEyeOff />
                            </LightIconButton>
                          }
                          dragHandleVisibility="always"
                        >
                          {fieldMetadataItem.label}
                        </DraggableListRow>
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
