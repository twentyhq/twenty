import { useRunApplicationHealthCheck } from '@/settings/applications/hooks/useRunApplicationHealthCheck';
import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';
import { useEffect } from 'react';

type SettingsApplicationHealthCheckEffectProps<TData> = {
  applicationId: string;
  runner: ApplicationHealthCheckRunner<TData>;
};

export const SettingsApplicationHealthCheckEffect = <TData,>({
  applicationId,
  runner,
}: SettingsApplicationHealthCheckEffectProps<TData>) => {
  const { runApplicationHealthCheck } = useRunApplicationHealthCheck({
    applicationId,
    runner,
  });

  useEffect(() => {
    runApplicationHealthCheck({ shouldKeepPreviousResult: false });
  }, [runApplicationHealthCheck]);

  return null;
};
