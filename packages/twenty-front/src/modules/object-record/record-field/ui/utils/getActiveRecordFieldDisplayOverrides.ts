import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';

export const getActiveRecordFieldDisplayOverrides = ({
  recordFieldDisplayOverrides,
  objectNameSingular,
  fieldNames,
  currentWorkspace,
}: {
  recordFieldDisplayOverrides: RecordFieldDisplayOverride[];
  objectNameSingular: string | undefined;
  fieldNames: string[];
  currentWorkspace: CurrentWorkspace | null | undefined;
}) =>
  recordFieldDisplayOverrides.filter(
    (recordFieldDisplayOverride) =>
      recordFieldDisplayOverride.objectNameSingular === objectNameSingular &&
      fieldNames.includes(recordFieldDisplayOverride.fieldName) &&
      checkIfFeatureFlagIsEnabledOnWorkspace(
        recordFieldDisplayOverride.featureFlagKey,
        currentWorkspace,
      ),
  );
