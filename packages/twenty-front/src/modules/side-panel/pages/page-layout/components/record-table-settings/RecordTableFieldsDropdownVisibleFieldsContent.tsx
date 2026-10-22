import { RECORD_TABLE_FIELDS_DROPDOWN_PAGE } from '@/side-panel/pages/page-layout/components/record-table-settings/constants/RecordTableFieldsDropdownPage';
import { ChartSettingsDropdownSection } from '@/side-panel/pages/page-layout/components/chart-settings/ChartSettingsDropdownSection';
import { DraggableListRow } from '@/ui/layout/draggable-list/components/DraggableListRow';
import { ApplicationStackIcon } from '@/applications/components/ApplicationStackIcon';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconEyeOff, useIcons } from 'twenty-ui/icon';
import { sortByProperty } from '~/utils/array/sortByProperty';

type RecordTableFieldsDropdownVisibleFieldsContentProps = {
  objectMetadataId: string;
  recordIndexId: string;
  onFieldUpdated?: (
    viewFieldId: string,
    update: Partial<{ position: number; isVisible: boolean }>,
  ) => void;
};

export const RecordTableFieldsDropdownVisibleFieldsContent = ({
  objectMetadataId,
  recordIndexId,
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
    <>
      <ChartSettingsDropdownSection>
        {isDefined(fieldMetadataItemLabelIdentifier) && (
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
        {isNonEmptyArray(draggableRecordFields) && (
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
                          startIcon={
                            <ApplicationStackIcon
                              Icon={getIcon(fieldMetadataItem.icon)}
                              applicationId={fieldMetadataItem.applicationId}
                            />
                          }
                          actions={
                            <LightIconButton
                              aria-label={t`Hide ${fieldMetadataItem.label}`}
                              onClick={() =>
                                handleHideField(recordField.fieldMetadataItemId)
                              }
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
      </ChartSettingsDropdownSection>
      <Dropdown.Separator />
      <Dropdown.Section>
        <Dropdown.ActionItem
          page={RECORD_TABLE_FIELDS_DROPDOWN_PAGE.HIDDEN_FIELDS}
          startIcon={<IconEyeOff />}
        >
          {t`Hidden Fields`}
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </>
  );
};
