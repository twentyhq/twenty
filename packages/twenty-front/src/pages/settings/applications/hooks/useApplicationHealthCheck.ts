import { useMutation } from '@apollo/client/react';
import { useEffect, useRef, useState } from 'react';
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

  // oxlint-disable-next-line twenty/no-state-useref
  const checkedApplicationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !isDefined(healthCheckLogicFunctionId) ||
      checkedApplicationIdRef.current === applicationId
    ) {
      return;
    }

    checkedApplicationIdRef.current = applicationId;

    const run = async () => {
      const { data } = await runApplicationHealthCheck({
        variables: { applicationId },
      });

      setHealthCheckResult(data?.runApplicationHealthCheck ?? null);
    };

    run().catch(() => {
      setHealthCheckResult(null);
    });
  }, [applicationId, healthCheckLogicFunctionId, runApplicationHealthCheck]);

  return { healthCheckResult };
};
