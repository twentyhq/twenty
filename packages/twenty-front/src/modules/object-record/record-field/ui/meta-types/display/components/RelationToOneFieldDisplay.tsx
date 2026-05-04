import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationToOneFieldDisplay';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const RelationToOneFieldDisplay = () => {
  const {
    fieldValue,
    fieldDefinition,
    generateRecordChipData,
    foreignKeyFieldValue,
  } = useRelationToOneFieldDisplay();

  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  // Return null instead of ForbiddenFieldDisplay when we have a foreign key but no record data
  // This handles the case where a related record is soft deleted (foreign key exists but record is not available)
  // Previously showed "Not shared" which was misleading for soft-deleted records
  if (!isDefined(fieldValue) && isDefined(foreignKeyFieldValue)) {
    return null;
  }

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
      forceDisableClick={
        isWorkspaceMemberFieldMetadataRelation || disableChipClick
      }
      triggerEvent={triggerEvent}
    />
  );
};
