import { type ReactNode, useContext } from 'react';

import { RecordDetailMorphRelationSectionDropdownManyToOne } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdownManyToOne';
import { RecordDetailMorphRelationSectionDropdownOneToMany } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdownOneToMany';
import { useIsMorphRelationReadOnlyFromRelatedRecordPerspective } from '@/object-record/record-field-list/record-detail-section/relation/components/hooks/useIsMorphRelationReadOnlyFromRelatedRecordPerspective';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type RecordDetailMorphRelationSectionDropdownProps = {
  loading: boolean;
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailMorphRelationSectionDropdown = ({
  loading,
  dropdownTriggerClickableComponent,
}: RecordDetailMorphRelationSectionDropdownProps) => {
  const { fieldDefinition, isRecordFieldReadOnly, recordId } =
    useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );
  const { relationType } = fieldDefinition.metadata;

  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  const isRecordReadOnlyFromRelatedRecordPerspective =
    useIsMorphRelationReadOnlyFromRelatedRecordPerspective({
      recordId,
      sourceObjectMetadataId: fieldDefinition.objectMetadataId ?? '',
      fieldMetadata: fieldDefinition.metadata,
    });

  if (
    loading ||
    isRecordFieldReadOnly ||
    isRecordReadOnlyFromRelatedRecordPerspective
  ) {
    return null;
  }

  if (isToOneObject) {
    return (
      <RecordDetailMorphRelationSectionDropdownManyToOne
        dropdownTriggerClickableComponent={dropdownTriggerClickableComponent}
      />
    );
  } else if (isToManyObjects) {
    return (
      <RecordDetailMorphRelationSectionDropdownOneToMany
        dropdownTriggerClickableComponent={dropdownTriggerClickableComponent}
      />
    );
  } else {
    return null;
  }
};
