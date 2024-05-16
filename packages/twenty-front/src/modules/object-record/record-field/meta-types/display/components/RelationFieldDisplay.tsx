import { RecordChip } from '@/object-record/components/RecordChip';
import { useRelationFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFieldDisplay';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition, maxWidth } = useRelationFieldDisplay();

  if (
    !fieldValue ||
    !fieldDefinition?.metadata.relationObjectMetadataNameSingular
  ) {
    return null;
  }

  return (
    <RecordChip
      objectNameSingular={
        fieldDefinition.metadata.relationObjectMetadataNameSingular
      }
      record={fieldValue as unknown as ObjectRecord} // Todo: Fix this type
      maxWidth={maxWidth}
    />
  );
};
