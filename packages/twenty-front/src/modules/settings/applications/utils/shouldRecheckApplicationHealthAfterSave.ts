import { type ApplicationVariablesSaveResult } from '@/settings/applications/types/ApplicationVariablesSaveResult';

export const shouldRecheckApplicationHealthAfterSave = ({
  saveResult,
  hasHealthCheck,
  hasMissingRequiredVariables,
}: {
  saveResult: ApplicationVariablesSaveResult;
  hasHealthCheck: boolean;
  hasMissingRequiredVariables: boolean;
}): boolean =>
  saveResult.isSaved &&
  hasHealthCheck &&
  !hasMissingRequiredVariables &&
  !saveResult.hasMissingRequiredVariables;
