import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RECORD_FIELD_DISPLAY_OVERRIDES } from '@/object-record/record-field/ui/constants/RecordFieldDisplayOverrides';
import { getActiveRecordFieldDisplayOverrides } from '@/object-record/record-field/ui/utils/getActiveRecordFieldDisplayOverrides';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useRecordFieldDisplayOverride = ({
  objectNameSingular,
  fieldName,
}: {
  objectNameSingular: string | undefined;
  fieldName: string;
}) => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return getActiveRecordFieldDisplayOverrides({
    recordFieldDisplayOverrides: RECORD_FIELD_DISPLAY_OVERRIDES,
    objectNameSingular,
    fieldNames: [fieldName],
    currentWorkspace,
  }).at(0);
};
