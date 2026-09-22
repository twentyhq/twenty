import { DraggableListItem } from '@/ui/layout/draggable-list/components/DraggableListItem';
import { LightIconButton } from 'twenty-ui/components';
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
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconEyeOff, useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { sortByProperty } from '~/utils/array/sortByProperty';

type RecordTableFieldsDropdownVisibleFieldsContentProps = {
  objectMetadataId: string;
  recordIndexId: string;
  onShowHiddenFields: () => void;
  onFieldUpdated?: (
    viewFieldId: string,
    update: Partial<{ position: number; isVisible: boolean }>,
  ) => void;
};

export const RecordTableFieldsDropdownVisibleFieldsContent = ({
  objectMetadataId,
  recordIndexId,
  onShowHiddenFields,
  onFieldUpdated,
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

  const handleDragEnd = (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    const updatedField = reorderVisibleRecordFields({
      recordFieldToMove: draggableRecordFields[result.source.index],
      targetRecordField: draggableRecordFields[result.destination.index],
    });

    onFieldUpdated?.(updatedField.id, { position: updatedField.position });
  };

  const handleHideField = (fieldMetadataId: string) => {
    const updatedField = updateRecordField(fieldMetadataId, {
      isVisible: false,
    });

    if (isDefined(updatedField)) {
      onFieldUpdated?.(updatedField.id, { isVisible: false });
    }
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {isDefined(fieldMetadataItemLabelIdentifier) && (
          <DraggableListItem
            placeholder
            grip="always"
            dragDisabled
            icon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
          >
            {fieldMetadataItemLabelIdentifier.label}
          </DraggableListItem>
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
                        <DraggableListItem
                          actions={
                            <LightIconButton
                              aria-label={t`Hide field`}
                              onClick={() =>
                                handleHideField(recordField.fieldMetadataItemId)
                              }
                            >
                              <IconEyeOff />
                            </LightIconButton>
                          }
                          grip="always"
                          icon={getIcon(fieldMetadataItem.icon)}
                        >
                          {fieldMetadataItem.label}
                        </DraggableListItem>
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
        <ListItem
          onClick={onShowHiddenFields}
          startIcon={<IconEyeOff />}
          render={<button type="button" />}
          hasSubmenu
        >{t`Hidden Fields`}</ListItem>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
