import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { ForbiddenFieldDisplay } from '@/object-record/record-field/ui/meta-types/display/components/ForbiddenFieldDisplay';
import { useMorphRelationToOneFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useMorphRelationToOneFieldDisplay';
import { useContext } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const MorphRelationManyToOneFieldDisplay = () => {
  const { morphFieldValuesWithObjectName, foreignKeyFieldValue } =
    useMorphRelationToOneFieldDisplay();

  const { disableChipClick, triggerEvent } = useContext(FieldContext);

  if (!isDefined(morphFieldValuesWithObjectName?.value)) {
    if (isDefined(foreignKeyFieldValue)) {
      return <ForbiddenFieldDisplay />;
    }

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
