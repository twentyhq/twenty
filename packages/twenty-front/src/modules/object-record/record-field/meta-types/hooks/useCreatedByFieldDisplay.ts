import { useContext } from 'react';

import { FieldCreatedByValue } from '@/object-record/record-field/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';

import { FieldContext } from '../../contexts/FieldContext';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersStates';

export const useCreatedByDisplay = () => {
  const { entityId, fieldDefinition } = useContext(FieldContext);

  const currentWorkspaceMembers = useRecoilValue(currentWorkspaceMembersState);

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValue<FieldCreatedByValue | undefined>(
    entityId,
    fieldName,
  );

  return {
    fieldDefinition,
    fieldValue: {
      ...fieldValue,
      workspaceMember: currentWorkspaceMembers.find(
        (member) => member.id === fieldValue?.workspaceMemberId,
      ),
    },
  };
};
