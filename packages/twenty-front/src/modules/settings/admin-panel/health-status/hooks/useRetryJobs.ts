import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useRetryJobsMutation } from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

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

      const response = result.data?.retryJobs;

      if (isDefined(response)) {
        const { retriedCount, results } = response;
        const failedResults = results.filter((r) => !r.success);

        if (retriedCount === -1) {
          enqueueSuccessSnackBar({
            message: t`All failed jobs have been retried`,
          });
        } else if (retriedCount > 0) {
          if (failedResults.length > 0) {
            enqueueSuccessSnackBar({
              message: plural(retriedCount, {
                one: `Successfully retried ${retriedCount} job`,
                other: `Successfully retried ${retriedCount} jobs`,
              }),
            });
            enqueueErrorSnackBar({
              message: plural(failedResults.length, {
                one: `${failedResults.length} job could not be retried`,
                other: `${failedResults.length} jobs could not be retried`,
              }),
            });
          } else {
            enqueueSuccessSnackBar({
              message: plural(retriedCount, {
                one: `Successfully retried ${retriedCount} job`,
                other: `Successfully retried ${retriedCount} jobs`,
              }),
            });
          }
        } else {
          const errorMessages = failedResults
            .map((r) => r.error)
            .filter(Boolean);
          const errorDetails =
            errorMessages.length > 0 ? `: ${errorMessages[0]}` : '';

          enqueueErrorSnackBar({
            message: t`No jobs were retried${errorDetails}`,
          });
        }

        onSuccess?.();
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof ApolloError
            ? getErrorMessageFromApolloError(error)
            : t`Failed to retry jobs. Please try again later.`,
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
