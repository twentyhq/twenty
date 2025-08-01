import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
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
  const { fieldDefinition, isRecordFieldReadOnly } = useContext(FieldContext);
  const { relationType } = fieldDefinition.metadata as FieldRelationMetadata;

  // TODO: use new relation type
  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  if (loading || isRecordFieldReadOnly) {
    return null;
  }

  if (isToOneObject) {
    return <RecordDetailRelationSectionDropdownToOne />;
  } else if (isToManyObjects) {
    return <RecordDetailRelationSectionDropdownToMany />;
  } else {
    return null;
  }
};
