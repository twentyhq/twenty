import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useMorphRelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationToOneFieldDisplay';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationManyToOneFieldDisplay = () => {
  const { fieldValues, fieldDefinition, generateRecordChipData } =
    useMorphRelationToOneFieldDisplay();

  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!isDefined(fieldValues)) {
    return null;
  }

  const fieldValue = fieldValues.filter(isDefined).pop();

  if (
    !isDefined(fieldValue) ||
    !isDefined(
      fieldDefinition?.metadata.morphRelations[0].targetObjectMetadata
        .nameSingular,
    )
  ) {
    return null;
  }

  // todo @guillim : adjust this to handle workspaemembers
  const isWorkspaceMemberFieldMetadataRelation = false;
  //   fieldDefinition.metadata.relationObjectMetadataNameSingular ===
  //   CoreObjectNameSingular.WorkspaceMember;
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
