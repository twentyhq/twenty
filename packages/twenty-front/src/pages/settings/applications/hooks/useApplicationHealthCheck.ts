import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  type ApplicationHealthCheckResult,
  RunApplicationHealthCheckDocument,
} from '~/generated-metadata/graphql';

export const useApplicationHealthCheck = ({
  applicationId,
  healthCheckLogicFunctionId,
}: {
  applicationId: string;
  healthCheckLogicFunctionId?: string | null;
}) => {
  const [runApplicationHealthCheck] = useMutation(
    RunApplicationHealthCheckDocument,
  );

  const [healthCheckResult, setHealthCheckResult] =
    useState<ApplicationHealthCheckResult | null>(null);

  const runHealthCheck = useCallback(async () => {
    if (!isDefined(healthCheckLogicFunctionId)) {
      return;
    }

    try {
      const { data } = await runApplicationHealthCheck({
        variables: { applicationId },
      });

      setHealthCheckResult(data?.runApplicationHealthCheck ?? null);
    } catch {
      setHealthCheckResult(null);
    }
  }, [applicationId, healthCheckLogicFunctionId, runApplicationHealthCheck]);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  return { healthCheckResult, runHealthCheck };
};
