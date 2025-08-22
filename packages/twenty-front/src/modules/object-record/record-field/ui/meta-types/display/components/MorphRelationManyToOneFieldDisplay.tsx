import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useMorphRelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationToOneFieldDisplay';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationManyToOneFieldDisplay = () => {
  const { morphFieldValuesWithObjectName } =
    useMorphRelationToOneFieldDisplay();

  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!isDefined(morphFieldValuesWithObjectName?.value)) {
    return null;
  }

  const isWorkspaceMemberFieldMetadataRelation =
    morphFieldValuesWithObjectName.objectNameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

  return (
    <RecordChip
      key={morphFieldValuesWithObjectName.value.id}
      objectNameSingular={morphFieldValuesWithObjectName.objectNameSingular}
      record={morphFieldValuesWithObjectName.value}
      forceDisableClick={
        isWorkspaceMemberFieldMetadataRelation || disableChipClick
      }
      triggerEvent={triggerEvent}
    />
  );
};
