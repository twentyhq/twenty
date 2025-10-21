import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError } from '@apollo/client';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDeleteJobsMutation } from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

export const useDeleteJobs = (queueName: string, onSuccess?: () => void) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteJobsMutation] = useDeleteJobsMutation();

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
            enqueueSuccessSnackBar({
              message: plural(deletedCount, {
                one: `Successfully deleted ${deletedCount} job`,
                other: `Successfully deleted ${deletedCount} jobs`,
              }),
            });
            enqueueErrorSnackBar({
              message: plural(failedResults.length, {
                one: `${failedResults.length} job could not be deleted`,
                other: `${failedResults.length} jobs could not be deleted`,
              }),
            });
          } else {
            enqueueSuccessSnackBar({
              message: plural(deletedCount, {
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

          enqueueErrorSnackBar({
            message: t`No jobs were deleted${errorDetails}`,
          });
        }
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof ApolloError
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
