import { useContext } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { useIsRecordReadOnly } from '@/object-record/record-field/hooks/useIsRecordReadOnly';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { RecordDetailRelationSectionDropdownToMany } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSectionDropdownToMany';
import { RecordDetailRelationSectionDropdownToOne } from '@/object-record/record-show/record-detail-section/components/RecordDetailRelationSectionDropdownToOne';
import { RelationType } from '~/generated-metadata/graphql';

type RecordDetailRelationSectionDropdownProps = {
  loading: boolean;
};

export const RecordDetailRelationSectionDropdown = ({
  loading,
}: RecordDetailRelationSectionDropdownProps) => {
  const { fieldDefinition, recordId } = useContext(FieldContext);
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

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId,
    objectMetadataId: isToOneObject
      ? recordObjectMetadataItem.id
      : relationObjectMetadataItem.id,
  });

  const isFieldReadOnly = useIsFieldValueReadOnly({
    fieldDefinition,
    isRecordReadOnly,
  });

  if (loading || isFieldReadOnly) return null;

  if (isToOneObject) {
    return <RecordDetailRelationSectionDropdownToOne />;
  } else if (isToManyObjects) {
    return <RecordDetailRelationSectionDropdownToMany />;
  } else {
    return null;
  }
};
