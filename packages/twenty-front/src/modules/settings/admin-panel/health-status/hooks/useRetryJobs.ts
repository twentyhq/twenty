import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRetryJobsMutation } from '~/generated-metadata/graphql';

export const useRetryJobs = (queueName: string, onSuccess?: () => void) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryJobsMutation] = useRetryJobsMutation();

  const retryJobs = async (jobIds: string[]) => {
    setIsRetrying(true);

    try {
      const result = await retryJobsMutation({
        variables: {
          queueName,
          jobIds,
        },
      });

      const retriedCount = result.data?.retryJobs;

      if (retriedCount !== undefined) {
        if (retriedCount === -1) {
          enqueueSuccessSnackBar({
            message: t`All failed jobs have been retried`,
          });
        } else if (retriedCount > 0) {
          enqueueSuccessSnackBar({
            message: plural(retriedCount, {
              one: `Successfully retried ${retriedCount} job`,
              other: `Successfully retried ${retriedCount} jobs`,
            }),
          });
        } else {
          enqueueErrorSnackBar({
            message: t`No jobs were retried. They may not be in failed state.`,
          });
        }

        onSuccess?.();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      enqueueErrorSnackBar({
        message: t`Failed to retry jobs: ${errorMessage}`,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    retryJobs,
    isRetrying,
  };
};
