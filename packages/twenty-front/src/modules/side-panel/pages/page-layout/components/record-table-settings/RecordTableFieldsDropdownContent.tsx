import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useReorderVisibleRecordFields } from '@/object-record/record-field/hooks/useReorderVisibleRecordFields';
import { useUpdateRecordField } from '@/object-record/record-field/hooks/useUpdateRecordField';
import { useUpsertRecordField } from '@/object-record/record-field/hooks/useUpsertRecordField';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { type DropResult } from '@hello-pangea/dnd';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconEye,
  IconEyeOff,
  useIcons,
} from 'twenty-ui/display';
import {
  MenuItemDraggable,
  MenuItemNavigate,
  MenuItem,
} from 'twenty-ui/navigation';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { v4 } from 'uuid';

type RecordTableFieldsDropdownContentProps = {
  viewId: string;
  objectMetadataId: string;
  dropdownId: string;
};

export const RecordTableFieldsDropdownContent = ({
  viewId,
  objectMetadataId,
}: RecordTableFieldsDropdownContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const recordIndexId = getRecordIndexIdFromObjectNamePluralAndViewId(
    objectMetadataItem.namePlural,
    viewId,
  );

  const [showHiddenFields, setShowHiddenFields] = useState(false);

  return (
    <RecordFieldsComponentInstanceContext.Provider
      value={{ instanceId: recordIndexId }}
    >
      {showHiddenFields ? (
        <RecordTableFieldsDropdownHiddenFieldsContent
          objectMetadataId={objectMetadataId}
          recordIndexId={recordIndexId}
          onBack={() => setShowHiddenFields(false)}
        />
      ) : (
        <RecordTableFieldsDropdownVisibleFieldsContent
          objectMetadataId={objectMetadataId}
          recordIndexId={recordIndexId}
          onShowHiddenFields={() => setShowHiddenFields(true)}
        />
      )}
    </RecordFieldsComponentInstanceContext.Provider>
  );
};

const RecordTableFieldsDropdownVisibleFieldsContent = ({
  objectMetadataId,
  recordIndexId,
  onShowHiddenFields,
}: {
  objectMetadataId: string;
  recordIndexId: string;
  onShowHiddenFields: () => void;
}) => {
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

const RecordTableFieldsDropdownHiddenFieldsContent = ({
  objectMetadataId,
  recordIndexId,
  onBack,
}: {
  objectMetadataId: string;
  recordIndexId: string;
  onBack: () => void;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { getIcon } = useIcons();

  const { upsertRecordField } = useUpsertRecordField(recordIndexId);

  const { updateRecordField } = useUpdateRecordField(recordIndexId);

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const visibleFieldMetadataItemIds = currentRecordFields
    .filter((recordField) => recordField.isVisible)
    .map((recordField) => recordField.fieldMetadataItemId);

  const hiddenFieldMetadataItems = activeFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      !visibleFieldMetadataItemIds.includes(fieldMetadataItem.id),
  );

  const handleShowField = (fieldMetadataId: string) => {
    const existingRecordField = currentRecordFields.find(
      (recordField) => recordField.fieldMetadataItemId === fieldMetadataId,
    );

    if (isDefined(existingRecordField)) {
      updateRecordField(fieldMetadataId, { isVisible: true });
    } else {
      const lastPosition =
        currentRecordFields.toSorted(sortByProperty('position', 'desc'))?.[0]
          ?.position ?? 0;

      const newRecordField: RecordField = {
        id: v4(),
        fieldMetadataItemId: fieldMetadataId,
        size: 100,
        isVisible: true,
        position: lastPosition + 1,
      };

      upsertRecordField(newRecordField);
    }
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Hidden Fields`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {hiddenFieldMetadataItems.map((fieldMetadataItem) => (
          <MenuItem
            key={fieldMetadataItem.id}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            iconButtons={[
              {
                Icon: IconEye,
                onClick: () => handleShowField(fieldMetadataItem.id),
              },
            ]}
            text={fieldMetadataItem.label}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
