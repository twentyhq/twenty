import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { useDeleteJobsMutation } from '~/generated-metadata/graphql';

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

      const deletedCount = result.data?.deleteJobs;

      if (deletedCount !== undefined && deletedCount > 0) {
        enqueueSuccessSnackBar({
          message: plural(deletedCount, {
            one: `Successfully deleted ${deletedCount} job`,
            other: `Successfully deleted ${deletedCount} jobs`,
          }),
        });

        onSuccess?.();
      } else {
        enqueueErrorSnackBar({
          message: t`No jobs were deleted. They may no longer exist.`,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      enqueueErrorSnackBar({
        message: t`Failed to delete jobs: ${errorMessage}`,
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
