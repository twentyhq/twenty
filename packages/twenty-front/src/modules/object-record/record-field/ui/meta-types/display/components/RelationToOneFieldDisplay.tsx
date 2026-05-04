import { CoreObjectNameSingular } from 'twenty-shared/types';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
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

  const targetObjectPermissions = useObjectPermissionsForObject(
    fieldDefinition.metadata.relationObjectMetadataId,
  );

  if (!isDefined(fieldValue) && isDefined(foreignKeyFieldValue)) {
    const hasRowLevelRestrictions =
      targetObjectPermissions.rowLevelPermissionPredicates.length > 0;

    if (hasRowLevelRestrictions) {
      return <ForbiddenFieldDisplay />;
    }

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
