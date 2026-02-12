import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecordFieldsScopeContextOrThrow } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { RecordDetailMorphRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdown';
import { RecordDetailRelationSectionDropdown } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdown';
import {
  FieldContext,
  type GenericFieldContextType,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import {
  FieldInputEventContext,
  type FieldInputEvent,
} from '@/object-record/record-field/ui/contexts/FieldInputEventContext';
import { usePersistField } from '@/object-record/record-field/ui/hooks/usePersistField';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldMorphRelationMetadata,
  type FieldRelationMetadata,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { getRecordFieldCardRelationPickerDropdownId } from '@/object-record/record-show/utils/getRecordFieldCardRelationPickerDropdownId';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { CustomError } from 'twenty-shared/utils';
import { IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

type FieldWidgetRelationEditActionProps = {
  fieldDefinition:
    | FieldDefinition<FieldRelationMetadata>
    | FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
};

const StyledEditButton = styled(LightIconButton)<{
  isDropdownOpen: boolean;
  isMobile: boolean;
}>`
  ${({ isDropdownOpen, isMobile, theme }) =>
    !isDropdownOpen &&
    css`
      opacity: ${isMobile ? 1 : 0};
      pointer-events: none;
      transition: opacity ${theme.animation.duration.instant}s ease;
    `}

  .widget:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

export const FieldWidgetRelationEditAction = ({
  fieldDefinition,
  recordId,
}: FieldWidgetRelationEditActionProps) => {
  const { scopeInstanceId } = useRecordFieldsScopeContextOrThrow();

  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) =>
      item.nameSingular === fieldDefinition.metadata.objectMetadataNameSingular,
  );

  if (!objectMetadataItem) {
    throw new CustomError(
      'Object metadata item not found',
      'OBJECT_METADATA_ITEM_NOT_FOUND',
    );
  }

  const persistField = usePersistField({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const handleSubmit: FieldInputEvent = ({ newValue }) => {
    persistField({
      recordId,
      fieldDefinition,
      valueToPersist: newValue,
    });
  };

  const fieldContextValue = {
    recordId,
    fieldDefinition,
    isLabelIdentifier: false,
    isRecordFieldReadOnly: false,
  } satisfies GenericFieldContextType;

  const isMorphRelation = isFieldMorphRelation(fieldDefinition);

  const relationSelectionDropdownId =
    getRecordFieldCardRelationPickerDropdownId({
      fieldDefinition,
      recordId,
      instanceId: scopeInstanceId,
    });

  const isRelationSelectionDropdownOpen = useRecoilComponentValue(
    isDropdownOpenComponentState,
    relationSelectionDropdownId,
  );

  const isMobile = useIsMobile();

  const dropdownTriggerClickableComponent = (
    <StyledEditButton
      isDropdownOpen={isRelationSelectionDropdownOpen}
      isMobile={isMobile}
      Icon={IconPencil}
      accent="secondary"
    />
  );

  return (
    <FieldContext.Provider value={fieldContextValue}>
      <FieldInputEventContext.Provider value={{ onSubmit: handleSubmit }}>
        {isMorphRelation ? (
          <RecordDetailMorphRelationSectionDropdown
            loading={false}
            dropdownTriggerClickableComponent={
              dropdownTriggerClickableComponent
            }
          />
        ) : (
          <RecordDetailRelationSectionDropdown
            loading={false}
            dropdownTriggerClickableComponent={
              dropdownTriggerClickableComponent
            }
          />
        )}
      </FieldInputEventContext.Provider>
    </FieldContext.Provider>
  );
};
