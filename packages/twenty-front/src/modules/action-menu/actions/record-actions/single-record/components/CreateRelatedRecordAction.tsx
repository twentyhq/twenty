import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';

interface CreateRelatedRecordActionProps {
  targetFieldMetadataItemRelation: FieldMetadataItemRelation;
}

export const CreateRelatedRecordAction = ({
  targetFieldMetadataItemRelation,
}: CreateRelatedRecordActionProps) => {
  // Get the source record ID
  const sourceRecordId = useSelectedRecordIdOrThrow();

  // Get the target object metadata item
  const { objectMetadataItem: targetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular:
        targetFieldMetadataItemRelation.targetObjectMetadata.nameSingular,
    });

  // Create a new index record
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: targetObjectMetadataItem,
  });

  const handleCreateRelatedRecord = () => {
    const foreignKeyFieldName =
      targetFieldMetadataItemRelation.targetFieldMetadata.name;
    const foreignKeyIdFieldName = `${foreignKeyFieldName}Id`;

    // Create the record with the foreign key set to the source record ID
    createNewIndexRecord({
      [foreignKeyIdFieldName]: sourceRecordId,
    });
  };

  return (
    <Action
      onClick={handleCreateRelatedRecord}
      closeSidePanelOnCommandMenuListActionExecution={false}
    />
  );
};
