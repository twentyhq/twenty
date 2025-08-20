import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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

  const fieldValue = fieldValues
    .filter((fieldValue) => isDefined(fieldValue.value))
    .pop();

  if (!isDefined(fieldValue?.value)) {
    return null;
  }

  const morphRelationSelected = fieldDefinition.metadata.morphRelations.find(
    (morphRelation) =>
      morphRelation.targetObjectMetadata.nameSingular === fieldValue.fieldName,
  );

  const isWorkspaceMemberFieldMetadataRelation =
    morphRelationSelected?.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  const recordChipData = generateRecordChipData(fieldValue.value);

  return (
    <RecordChip
      key={recordChipData.recordId}
      objectNameSingular={recordChipData.objectNameSingular}
      record={fieldValue.value}
      forceDisableClick={
        isWorkspaceMemberFieldMetadataRelation || disableChipClick
      }
      triggerEvent={triggerEvent}
    />
  );
};
