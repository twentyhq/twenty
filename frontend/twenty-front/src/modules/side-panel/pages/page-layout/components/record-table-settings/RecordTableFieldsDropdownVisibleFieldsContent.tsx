import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { type DropResult } from '@hello-pangea/dnd';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEyeOff, useIcons } from 'twenty-ui/display';
import { MenuItemDraggable, MenuItemNavigate } from 'twenty-ui/navigation';
import { sortByProperty } from '~/utils/array/sortByProperty';

type RecordTableFieldsDropdownVisibleFieldsContentProps = {
  objectMetadataId: string;
  recordIndexId: string;
  onShowHiddenFields: () => void;
};

export const RecordTableFieldsDropdownVisibleFieldsContent = ({
  objectMetadataId,
  recordIndexId,
  onShowHiddenFields,
}: RecordTableFieldsDropdownVisibleFieldsContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { getIcon } = useIcons();

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { reorderVisibleRecordFields } =
    useReorderVisibleRecordFields(recordIndexId);

  const { updateRecordField } = useUpdateRecordField(recordIndexId);

  const fieldMetadataItemLabelIdentifier =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const nonDraggableRecordField = visibleRecordFields.find(
    (recordField) =>
      recordField.fieldMetadataItemId === fieldMetadataItemLabelIdentifier?.id,
  );

  const draggableRecordFields = visibleRecordFields
    .filter(
      (recordField) =>
        nonDraggableRecordField?.fieldMetadataItemId !==
        recordField.fieldMetadataItemId,
    )
    .toSorted(sortByProperty('position'));

  const handleDragEnd = (result: DropResult) => {
    if (
      !result.destination ||
      result.destination.index === 1 ||
      result.source.index === 1
    ) {
      return;
    }

    reorderVisibleRecordFields({
      fromIndex: result.source.index - 1,
      toIndex: result.destination.index - 1,
    });
  };

  const handleHideField = (fieldMetadataId: string) => {
    updateRecordField(fieldMetadataId, { isVisible: false });
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {isDefined(fieldMetadataItemLabelIdentifier) && (
          <MenuItemDraggable
            LeftIcon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
            text={fieldMetadataItemLabelIdentifier.label}
            accent="placeholder"
            gripMode="always"
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
                      itemComponent={
                        <MenuItemDraggable
                          LeftIcon={getIcon(fieldMetadataItem.icon)}
                          iconButtons={[
                            {
                              Icon: IconEyeOff,
                              onClick: () =>
                                handleHideField(
                                  recordField.fieldMetadataItemId,
                                ),
                            },
                          ]}
                          text={fieldMetadataItem.label}
                          gripMode="always"
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
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <MenuItemNavigate
          onClick={onShowHiddenFields}
          LeftIcon={IconEyeOff}
          text={t`Hidden Fields`}
        />
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
