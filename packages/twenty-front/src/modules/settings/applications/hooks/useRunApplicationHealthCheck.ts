import { type ApplicationHealthCheckRunner } from '@/settings/applications/types/ApplicationHealthCheckRunner';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { t } from '@lingui/core/macro';
import { useToast } from 'twenty-ui/components/feedback';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const useRunApplicationHealthCheck = <TData>({
  applicationId,
  runner: { healthCheckFamilyState, healthCheckMutation, getHealthCheckResult },
}: {
  applicationId: string;
  runner: ApplicationHealthCheckRunner<TData>;
}) => {
  const store = useStore();
  const { enqueueToast } = useToast();

  const [runHealthCheckMutation] = useMutation(healthCheckMutation);

  const runApplicationHealthCheck = useCallback(
    async ({
      shouldKeepPreviousResult,
    }: {
      shouldKeepPreviousResult: boolean;
    }) => {
      const healthCheckAtom = healthCheckFamilyState.atomFamily(applicationId);
      const runId = v4();

      store.set(healthCheckAtom, (previousHealthCheck) => ({
        runId,
        result: shouldKeepPreviousResult ? previousHealthCheck.result : null,
      }));

      const response = await runHealthCheckMutation({
        variables: { applicationId },
      }).catch(() => {
        if (store.get(healthCheckAtom).runId === runId) {
          enqueueToast({
            status: 'error',
            children: t`Failed to check the app's health.`,
          });
        }

        return undefined;
      });

      if (!isDefined(response) || store.get(healthCheckAtom).runId !== runId) {
        return;
      }

      store.set(healthCheckAtom, {
        runId,
        result: isDefined(response.data)
          ? getHealthCheckResult(response.data)
          : null,
      });
    },
    [
      applicationId,
      enqueueToast,
      getHealthCheckResult,
      healthCheckFamilyState,
      runHealthCheckMutation,
      store,
    ],
  );

  return { runApplicationHealthCheck };
};
