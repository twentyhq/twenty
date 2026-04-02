import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { ObjectOptionsDropdownContext } from '@/object-record/object-options-dropdown/states/contexts/ObjectOptionsDropdownContext';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewType } from '@/views/types/ViewType';
import { useContext, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconChevronLeft, IconChevronRight, IconEye, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

// OMNIA-CUSTOM: Field types that can be displayed as relation sub-field columns
const DISPLAYABLE_SUB_FIELD_TYPES = new Set([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.DATE,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.PHONES,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.LINKS,
  FieldMetadataType.UUID,
]);

export const ViewFieldsHiddenDropdownSection = () => {
  const { viewType, objectMetadataItem, recordIndexId } = useContext(
    ObjectOptionsDropdownContext,
  );

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordIndexId);

  const { handleBoardFieldVisibilityChange } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const handleChangeFieldVisibility =
    viewType === ViewType.KANBAN
      ? handleBoardFieldVisibilityChange
      : changeRecordFieldVisibility;

  const currentRecordFields = useAtomComponentStateValue(
    currentRecordFieldsComponentState,
  );

  const visibleRecordFields = currentRecordFields.filter(
    (recordFieldToFilter) => recordFieldToFilter.isVisible === true,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  // OMNIA-CUSTOM: Track which relation field is expanded for sub-field selection
  const [expandedRelationFieldId, setExpandedRelationFieldId] = useState<
    string | null
  >(null);

  const { objectMetadataItems } = useObjectMetadataItems();

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      !visibleRecordFields.some(
        (recordField) =>
          recordField.fieldMetadataItemId === fieldMetadataItemToFilter.id &&
          !recordField.subFieldName,
      ),
  );

  // OMNIA-CUSTOM: Also show already-visible MANY_TO_ONE relations for sub-field expansion
  const visibleRelationFields = activeFieldMetadataItems.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type === 'MANY_TO_ONE' &&
      visibleRecordFields.some(
        (rf) => rf.fieldMetadataItemId === field.id && !rf.subFieldName,
      ),
  );

  const { getIcon } = useIcons();

  // OMNIA-CUSTOM: If a relation field is expanded, show its sub-fields
  if (expandedRelationFieldId) {
    const relationField = activeFieldMetadataItems.find(
      (f) => f.id === expandedRelationFieldId,
    );

    const targetObjectNameSingular =
      relationField?.relation?.targetObjectMetadata?.nameSingular;

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === targetObjectNameSingular,
    );

    const subFields =
      targetObjectMetadata?.fields.filter(
        (field) =>
          field.isActive &&
          !field.isSystem &&
          DISPLAYABLE_SUB_FIELD_TYPES.has(field.type as FieldMetadataType) &&
          // Exclude sub-fields already visible
          !visibleRecordFields.some(
            (vf) =>
              vf.fieldMetadataItemId === expandedRelationFieldId &&
              vf.subFieldName === field.name,
          ),
      ) ?? [];

    return (
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconChevronLeft}
          text={relationField?.label ?? 'Back'}
          onClick={() => setExpandedRelationFieldId(null)}
        />
        {subFields.map((subField) => (
          <MenuItem
            key={subField.id}
            LeftIcon={getIcon(subField.icon)}
            iconButtons={[
              {
                Icon: IconEye,
                onClick: () =>
                  handleChangeFieldVisibility({
                    fieldMetadataId: expandedRelationFieldId,
                    isVisible: true,
                    subFieldName: subField.name,
                  }),
              },
            ]}
            text={subField.label}
          />
        ))}
      </DropdownMenuItemsContainer>
    );
  }

  return (
    <>
      <DropdownMenuItemsContainer>
        {/* OMNIA-CUSTOM: Show visible relations with expand for sub-fields */}
        {visibleRelationFields.map((fieldMetadataItem) => (
          <MenuItem
            key={`rel-${fieldMetadataItem.id}`}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            iconButtons={[
              {
                Icon: IconChevronRight,
                onClick: () =>
                  setExpandedRelationFieldId(fieldMetadataItem.id),
              },
            ]}
            text={`${fieldMetadataItem.label} fields...`}
          />
        ))}
        {availableFieldMetadataItemsToShow.length > 0 &&
          availableFieldMetadataItemsToShow.map((fieldMetadataItem) => {
            // OMNIA-CUSTOM: MANY_TO_ONE relations get an expand chevron
            const isManyToOneRelation =
              fieldMetadataItem.type === FieldMetadataType.RELATION &&
              fieldMetadataItem.relation?.type === 'MANY_TO_ONE';

            return (
              <MenuItem
                key={fieldMetadataItem.id}
                LeftIcon={getIcon(fieldMetadataItem.icon)}
                iconButtons={[
                  {
                    Icon: IconEye,
                    onClick: () =>
                      handleChangeFieldVisibility({
                        fieldMetadataId: fieldMetadataItem.id,
                        isVisible: true,
                      }),
                  },
                  ...(isManyToOneRelation
                    ? [
                        {
                          Icon: IconChevronRight,
                          onClick: () =>
                            setExpandedRelationFieldId(fieldMetadataItem.id),
                        },
                      ]
                    : []),
                ]}
                text={fieldMetadataItem.label}
              />
            );
          })}
      </DropdownMenuItemsContainer>
    </>
  );
};
