import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
import { styled } from '@linaria/react';
import { CustomError } from 'twenty-shared/utils';
import { IconPencil, IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { RelationType } from '~/generated-metadata/graphql';

type FieldWidgetRelationEditActionProps = {
  fieldDefinition:
    | FieldDefinition<FieldRelationMetadata>
    | FieldDefinition<FieldMorphRelationMetadata>;
  recordId: string;
};

const StyledEditButtonWrapper = styled.div`
  opacity: 1;
  pointer-events: auto;
`;

export const FieldWidgetRelationEditAction = ({
  fieldDefinition,
  recordId,
}: FieldWidgetRelationEditActionProps) => {
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

  const triggerIcon =
    fieldDefinition.metadata.relationType === RelationType.MANY_TO_ONE
      ? IconPencil
      : IconPlus;

  const dropdownTriggerClickableComponent = (
    <StyledEditButtonWrapper>
      <LightIconButton Icon={triggerIcon} accent="secondary" />
    </StyledEditButtonWrapper>
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
