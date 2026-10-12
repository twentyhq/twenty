import { CoreObjectNameSingular } from 'twenty-shared/types';
import { CoreWorkflowRunRelationFieldDisplay } from '@/object-core/workflows/components/CoreWorkflowRunRelationFieldDisplay';
import { useIsCoreWorkflowRunRelationField } from '@/object-core/workflows/hooks/useIsCoreWorkflowRunRelationField';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { useRelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationToOneFieldDisplay';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RelationToOneFieldDisplay = () => {
  const {
    fieldValue,
    fieldDefinition,
    generateRecordChipData,
    foreignKeyFieldValue,
  } = useRelationToOneFieldDisplay();

  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  const isCoreWorkflowRunRelationField = useIsCoreWorkflowRunRelationField({
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
    fieldName: fieldDefinition.metadata.fieldName,
  });

  if (isCoreWorkflowRunRelationField) {
    return <CoreWorkflowRunRelationFieldDisplay />;
  }

  if (!isDefined(fieldValue) && isDefined(foreignKeyFieldValue)) {
    return <ForbiddenFieldDisplay />;
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
