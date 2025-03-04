import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useRelationToOneFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationToOneFieldDisplay';
import { isDefined } from 'twenty-shared';

export const RelationToOneFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationToOneFieldDisplay();

  if (
    !isDefined(fieldValue) ||
    !isDefined(fieldDefinition?.metadata.relationObjectMetadataNameSingular)
  ) {
    return null;
  }

  const isWorkspaceMemberFieldMetadataRelation =
    fieldDefinition.metadata.relationObjectMetadataNameSingular ===
    CoreObjectNameSingular.WorkspaceMember;
  const recordChipData = generateRecordChipData(fieldValue);

  return (
    <RecordChip
      key={recordChipData.recordId}
      objectNameSingular={recordChipData.objectNameSingular}
      record={fieldValue}
      forceDisableClick={isWorkspaceMemberFieldMetadataRelation}
    />
  );
};
