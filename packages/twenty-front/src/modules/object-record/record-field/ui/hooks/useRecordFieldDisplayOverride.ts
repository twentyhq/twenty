import { useContext } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordFieldDisplayOverridesContext } from '@/object-record/record-field/ui/contexts/RecordFieldDisplayOverridesContext';
import { getActiveRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getActiveRecordFieldDisplayOverrides';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useRecordFieldDisplayOverride = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string | undefined;
  fieldName: string;
}) => {
  const recordFieldDisplayOverrides = useContext(
    RecordFieldDisplayOverridesContext,
  );

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return getActiveRecordFieldDisplayOverrides({
    recordFieldDisplayOverrides,
    objectNameSingular,
    fieldNames: [fieldName],
    currentWorkspace,
  }).at(0);
};
