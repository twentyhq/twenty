import { useContext } from 'react';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { isRecordReadOnly } from '@/object-record/read-only/utils/isRecordReadOnly';
import { RecordDetailMorphRelationSectionDropdownManyToOne } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdownManyToOne';
import { RecordDetailMorphRelationSectionDropdownOneToMany } from '@/object-record/record-field-list/record-detail-section/relation/components/RecordDetailMorphRelationSectionDropdownOneToMany';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsRecordDeleted } from '@/object-record/record-field/ui/hooks/useIsRecordDeleted';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type RecordDetailMorphRelationSectionDropdownProps = {
  loading: boolean;
};

export const RecordDetailMorphRelationSectionDropdown = ({
  loading,
}: RecordDetailMorphRelationSectionDropdownProps) => {
  const { fieldDefinition, isRecordFieldReadOnly, recordId } =
    useContext(FieldContext);
  const { relationType, morphRelations } =
    fieldDefinition.metadata as FieldMorphRelationMetadata;

  const { objectMetadataItems } = useObjectMetadataItems();
  const relatedObjectMetadataItems = morphRelations
    .map((morphRelation) => morphRelation.targetObjectMetadata.id)
    .map((objectMetadataId) =>
      objectMetadataItems.find(
        (objectMetadataItem) => objectMetadataItem.id === objectMetadataId,
      ),
    )
    .filter(isDefined);

  const isToOneObject = relationType === RelationType.MANY_TO_ONE;
  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  const isDeleted = useIsRecordDeleted({ recordId });

  const isRecordReadOnlyFromRelatedRecordPerspective =
    relatedObjectMetadataItems.some((relatedObjectMetadataItem) => {
      return isRecordReadOnly({
        objectPermissions: {
          canUpdateObjectRecords: true,
          objectMetadataId: relatedObjectMetadataItem.id,
        },
        isRecordDeleted: isDeleted,
        objectMetadataItem: relatedObjectMetadataItem,
      });
    });

  if (
    loading ||
    isRecordFieldReadOnly ||
    isRecordReadOnlyFromRelatedRecordPerspective
  ) {
    return null;
  }

  if (isToOneObject) {
    return <RecordDetailMorphRelationSectionDropdownManyToOne />;
  } else if (isToManyObjects) {
    return <RecordDetailMorphRelationSectionDropdownOneToMany />;
  } else {
    return null;
  }
};
