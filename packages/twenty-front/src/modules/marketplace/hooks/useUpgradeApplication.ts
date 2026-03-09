import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useUpgradeApplicationMutation } from '~/generated-metadata/graphql';

export const useUpgradeApplication = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [upgradeApplicationMutation] = useUpgradeApplicationMutation();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const upgrade = async (params: {
    appRegistrationId: string;
    targetVersion: string;
  }) => {
    setIsUpgrading(true);

    try {
      const result = await upgradeApplicationMutation({
        variables: params,
      });

      if (isDefined(result.data)) {
        enqueueSuccessSnackBar({
          message: t`Application upgraded successfully.`,
        });

        return true;
      }

      return false;
    } catch (error) {
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
