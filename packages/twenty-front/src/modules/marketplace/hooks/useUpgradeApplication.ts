import { isApplicationOperationInProgressError } from '@/applications/utils/isApplicationOperationInProgressError';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { UpgradeApplicationAsyncDocument } from '~/generated-metadata/graphql';

export const useUpgradeApplication = () => {
  const { enqueueErrorSnackBar } = useSnackBar();
  const [upgradeApplicationMutation] = useMutation(
    UpgradeApplicationAsyncDocument,
  );
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgrade = async (params: {
    appRegistrationId: string;
    targetVersion: string;
  }): Promise<boolean> => {
    setIsUpgrading(true);

    try {
      await upgradeApplicationMutation({ variables: params });

      return true;
    } catch (error) {
      if (isApplicationOperationInProgressError(error)) {
        return true;
      }

      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to upgrade the application.`,
      });

      return false;
    } finally {
      setIsUpgrading(false);
    }
  };

  return { upgrade, isUpgrading };
};
