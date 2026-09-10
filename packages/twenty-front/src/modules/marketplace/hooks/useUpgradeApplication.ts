import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { UpgradeApplicationDocument } from '~/generated-metadata/graphql';

export const useUpgradeApplication = () => {
  const { enqueueToast } = useToast();
  const [upgradeApplicationMutation] = useMutation(UpgradeApplicationDocument);
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
        enqueueToast({
          variant: 'success',
          children: t`Application upgraded successfully.`,
        });

        return true;
      }

      return false;
    } catch (error) {
      const graphqlMessage = error instanceof Error ? error.message : undefined;

      enqueueToast({
        variant: 'error',
        children: graphqlMessage ?? t`Failed to upgrade the application.`,
      });

      return false;
    } finally {
      setIsUpgrading(false);
    }
  };

  return { upgrade, isUpgrading };
};
