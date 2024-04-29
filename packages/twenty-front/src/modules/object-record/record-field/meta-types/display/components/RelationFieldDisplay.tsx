import { RecordChip } from '@/object-record/components/RecordChip';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationFieldDisplay = () => {
  const { fieldValue, fieldDefinition, maxWidth } = useRelationField();

  if (!fieldValue || !fieldDefinition) return null;

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
