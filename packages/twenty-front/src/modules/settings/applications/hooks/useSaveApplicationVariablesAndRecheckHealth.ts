import { useRunApplicationHealthCheck } from '@/settings/applications/hooks/useRunApplicationHealthCheck';
import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';
import { type ApplicationVariablesSaveResult } from '@/settings/applications/types/ApplicationVariablesSaveResult';
import { shouldRecheckApplicationHealthAfterSave } from '@/settings/applications/utils/shouldRecheckApplicationHealthAfterSave';

export const useSaveApplicationVariablesAndRecheckHealth = <TData>({
  applicationId,
  runner,
  hasHealthCheck,
  hasMissingRequiredVariables,
  saveApplicationVariables,
}: {
  applicationId: string;
  runner: ApplicationHealthCheckRunner<TData>;
  hasHealthCheck: boolean;
  hasMissingRequiredVariables: boolean;
  saveApplicationVariables: () => Promise<ApplicationVariablesSaveResult>;
}) => {
  const { runApplicationHealthCheck } = useRunApplicationHealthCheck({
    applicationId,
    runner,
  });

  const saveApplicationVariablesAndRecheckHealth = async () => {
    const saveResult = await saveApplicationVariables();

    if (
      !shouldRecheckApplicationHealthAfterSave({
        saveResult,
        hasHealthCheck,
        hasMissingRequiredVariables,
      })
    ) {
      return;
    }

    await runApplicationHealthCheck({ shouldKeepPreviousResult: true });
  };

  return { saveApplicationVariablesAndRecheckHealth };
};
