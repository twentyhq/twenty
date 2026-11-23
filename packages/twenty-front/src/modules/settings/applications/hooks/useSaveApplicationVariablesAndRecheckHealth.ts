import { useRunApplicationHealthCheck } from '@/settings/applications/hooks/useRunApplicationHealthCheck';
import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';

export const useSaveApplicationVariablesAndRecheckHealth = <TData>({
  applicationId,
  runner,
  saveApplicationVariables,
}: {
  applicationId: string;
  runner: ApplicationHealthCheckRunner<TData>;
  saveApplicationVariables: () => Promise<boolean>;
}) => {
  const { runApplicationHealthCheck } = useRunApplicationHealthCheck({
    applicationId,
    runner,
  });

  const saveApplicationVariablesAndRecheckHealth = async () => {
    const isSaved = await saveApplicationVariables();

    if (isSaved) {
      await runApplicationHealthCheck({ shouldKeepPreviousResult: true });
    }
  };

  return { saveApplicationVariablesAndRecheckHealth };
};
