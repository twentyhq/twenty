import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { DeleteJobsDocument } from '~/generated-admin/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useDeleteJobs = (queueName: string, onSuccess?: () => void) => {
  const apolloAdminClient = useApolloAdminClient();
  const { add: addToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteJobsMutation] = useMutation(DeleteJobsDocument, {
    client: apolloAdminClient,
  });

  const deleteJobs = async (jobIds: string[]) => {
    setIsDeleting(true);

    try {
      const result = await deleteJobsMutation({
        variables: {
          queueName,
          jobIds,
        },
      });

      const response = result.data?.deleteJobs;

      if (isDefined(response)) {
        const { deletedCount, results } = response;
        const failedResults = results.filter((r) => !r.success);

        if (deletedCount > 0) {
          if (failedResults.length > 0) {
            addToast({
              variant: 'success',
              children: plural(deletedCount, {
                one: `Successfully deleted ${deletedCount} job`,
                other: `Successfully deleted ${deletedCount} jobs`,
              }),
            });
            addToast({
              variant: 'error',
              children: plural(failedResults.length, {
                one: `${failedResults.length} job could not be deleted`,
                other: `${failedResults.length} jobs could not be deleted`,
              }),
            });
          } else {
            addToast({
              variant: 'success',
              children: plural(deletedCount, {
                one: `Successfully deleted ${deletedCount} job`,
                other: `Successfully deleted ${deletedCount} jobs`,
              }),
            });
          }

          onSuccess?.();
        } else {
          const errorMessages = failedResults
            .map((r) => r.error)
            .filter(Boolean);
          const errorDetails =
            errorMessages.length > 0 ? `: ${errorMessages[0]}` : '';

          addToast({
            variant: 'error',
            children: t`No jobs were deleted${errorDetails}`,
          });
        }
      }
    } catch (error) {
      addToast({
        variant: 'error',
        children: CombinedGraphQLErrors.is(error)
          ? getErrorMessageFromApolloError(error)
          : t`Failed to delete jobs. Please try again later.`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteJobs,
    isDeleting,
  };
};
