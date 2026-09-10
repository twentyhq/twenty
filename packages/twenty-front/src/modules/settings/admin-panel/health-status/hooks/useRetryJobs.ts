import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { RetryJobsDocument } from '~/generated-admin/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useRetryJobs = (queueName: string, onSuccess?: () => void) => {
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueToast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryJobsMutation] = useMutation(RetryJobsDocument, {
    client: apolloAdminClient,
  });

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
          enqueueToast({
            variant: 'success',
            children: t`All failed jobs have been retried`,
          });
        } else if (retriedCount > 0) {
          if (failedResults.length > 0) {
            enqueueToast({
              variant: 'success',
              children: plural(retriedCount, {
                one: `Successfully retried ${retriedCount} job`,
                other: `Successfully retried ${retriedCount} jobs`,
              }),
            });
            enqueueToast({
              variant: 'error',
              children: plural(failedResults.length, {
                one: `${failedResults.length} job could not be retried`,
                other: `${failedResults.length} jobs could not be retried`,
              }),
            });
          } else {
            enqueueToast({
              variant: 'success',
              children: plural(retriedCount, {
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

          enqueueToast({
            variant: 'error',
            children: t`No jobs were retried${errorDetails}`,
          });
        }

        onSuccess?.();
      }
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children: CombinedGraphQLErrors.is(error)
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
