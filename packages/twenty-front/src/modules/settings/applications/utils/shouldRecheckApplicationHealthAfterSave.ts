import { type ApplicationVariablesSaveResult } from '@/settings/applications/types/ApplicationVariablesSaveResult';

export const shouldRecheckApplicationHealthAfterSave = ({
  saveResult,
  hasMissingRequiredVariables,
}: {
  saveResult: ApplicationVariablesSaveResult;
  hasMissingRequiredVariables: boolean;
}): boolean =>
  saveResult.isSaved &&
  !hasMissingRequiredVariables &&
  !saveResult.hasMissingRequiredVariables;
