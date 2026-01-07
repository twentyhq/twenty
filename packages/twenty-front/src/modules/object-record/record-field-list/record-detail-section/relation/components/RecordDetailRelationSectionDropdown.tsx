import { type ReactNode, useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordDetailRelationSectionDropdownToMany } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdownToMany';
import { RecordDetailRelationSectionDropdownToOne } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailRelationSectionDropdownToOne';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { RelationType } from '~/generated-metadata/graphql';

type RecordDetailRelationSectionDropdownProps = {
  loading: boolean;
  dropdownTriggerClickableComponent?: ReactNode;
};

export const RecordDetailRelationSectionDropdown = ({
  loading,
  dropdownTriggerClickableComponent,
}: RecordDetailRelationSectionDropdownProps) => {
  const { fieldDefinition, isRecordFieldReadOnly, recordId } =
    useContext(FieldContext);
  const {
    relationType,
    objectMetadataNameSingular,
    relationObjectMetadataNameSingular,
  } = fieldDefinition.metadata as FieldRelationMetadata;

  const { objectMetadataItem: recordObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: objectMetadataNameSingular ?? '',
    });

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });
  // TODO: use new relation type
  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  const isRecordReadOnlyFromRelatedRecordPerspective = useIsRecordReadOnly({
    recordId,
    objectMetadataId: isToOneObject
      ? recordObjectMetadataItem.id
      : relationObjectMetadataItem.id,
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
      <RecordDetailRelationSectionDropdownToOne
        dropdownTriggerClickableComponent={dropdownTriggerClickableComponent}
      />
    );
  } else if (isToManyObjects) {
    return (
      <RecordDetailRelationSectionDropdownToMany
        dropdownTriggerClickableComponent={dropdownTriggerClickableComponent}
      />
    );
  } else {
    return null;
  }
};
