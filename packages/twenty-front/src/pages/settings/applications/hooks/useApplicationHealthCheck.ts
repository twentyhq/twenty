import { useMutation } from '@apollo/client/react';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { RunApplicationHealthCheckDocument } from '~/generated-metadata/graphql';

export const useApplicationHealthCheck = ({
  applicationId,
  healthCheckLogicFunctionId,
  refetchApplication,
}: {
  applicationId: string;
  healthCheckLogicFunctionId?: string | null;
  refetchApplication: () => void;
}) => {
  const [runApplicationHealthCheck] = useMutation(
    RunApplicationHealthCheckDocument,
  );

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
      await runApplicationHealthCheck({ variables: { applicationId } });

      refetchApplication();
    };

    run().catch(() => {
      // A health check that cannot even be reached leaves the stored status
      // untouched; the page keeps showing what was last known.
    });
  }, [
    applicationId,
    healthCheckLogicFunctionId,
    runApplicationHealthCheck,
    refetchApplication,
  ]);
};
