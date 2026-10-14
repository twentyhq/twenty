import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFieldLabelAndIcon } from '@/object-record/record-field/utils/getRecordFieldLabelAndIcon';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordFieldKey } from '@/object-record/record-field/utils/getRecordFieldKey';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import {
  ListItemButton,
  MenuItemDraggable,
} from 'twenty-ui/components/navigation';
import { IconEyeOff, useIcons } from 'twenty-ui/icon';
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

  const { objectMetadataItems } = useObjectMetadataItems();

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
    .filter((recordField) => recordField !== nonDraggableRecordField)
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

  const handleHideField = (recordField: RecordField) => {
    const updatedField = updateRecordField(getRecordFieldKey(recordField), {
      isVisible: false,
    });

    if (isDefined(updatedField)) {
      onFieldUpdated?.(updatedField.id, { isVisible: false });
    }
  };

  return (
    <LegacyDropdownContent>
      <DropdownMenuItemsContainer>
        {isDefined(fieldMetadataItemLabelIdentifier) && (
          <MenuItemDraggable
            LeftComponent={
              <ApplicationStackIcon
                Icon={getIcon(fieldMetadataItemLabelIdentifier.icon)}
                applicationId={fieldMetadataItemLabelIdentifier.applicationId}
              />
            }
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
                  const labelAndIcon = getRecordFieldLabelAndIcon({
                    recordField,
                    objectMetadataItem,
                    objectMetadataItems,
                  });
                  const recordFieldKey = getRecordFieldKey(recordField);

                  if (!isDefined(labelAndIcon)) {
                    return null;
                  }

                  return (
                    <DraggableItem
                      key={recordFieldKey}
                      draggableId={recordFieldKey}
                      index={index}
                      itemComponent={
                        <MenuItemDraggable
                          LeftComponent={
                            <ApplicationStackIcon
                              Icon={getIcon(labelAndIcon.icon)}
                              applicationId={labelAndIcon.applicationId}
                            />
                          }
                          iconButtons={
                            <LightIconButton
                              aria-label={t`Hide field`}
                              onClick={() => handleHideField(recordField)}
                            >
                              <IconEyeOff />
                            </LightIconButton>
                          }
                          text={labelAndIcon.label}
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
        <ListItemButton
          onClick={onShowHiddenFields}
          startIcon={<IconEyeOff />}
          hasSubmenu
        >{t`Hidden Fields`}</ListItemButton>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
