import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useLazyQuery, useMutation } from '@apollo/client/react';
import {
  PlanApplicationUpgradeDocument,
  type PlanApplicationUpgradeQuery,
  UpgradeApplicationDocument,
} from '~/generated-metadata/graphql';

export type ApplicationUpgradePlan =
  PlanApplicationUpgradeQuery['planApplicationUpgrade'];

const extractErrorMessage = (error: unknown): string | undefined =>
  error instanceof Error ? error.message : undefined;

export const useUpgradeApplication = () => {
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [upgradeApplicationMutation] = useMutation(UpgradeApplicationDocument);
  const [planApplicationUpgradeQuery] = useLazyQuery(
    PlanApplicationUpgradeDocument,
    { fetchPolicy: 'network-only' },
  );
  const [isPlanning, setIsPlanning] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const planUpgrade = async (params: {
    appRegistrationId: string;
    targetVersion: string;
  }): Promise<ApplicationUpgradePlan | null> => {
    setIsPlanning(true);

    try {
      const result = await planApplicationUpgradeQuery({
        variables: params,
      });

      return result.data?.planApplicationUpgrade ?? null;
    } catch (error) {
      const graphqlMessage = extractErrorMessage(error);

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to compute the upgrade plan.`,
      });

      return null;
    } finally {
      setIsPlanning(false);
    }
  };

  const upgrade = async (params: {
    appRegistrationId: string;
    targetVersion: string;
    allowDestructive?: boolean;
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
      const graphqlMessage = extractErrorMessage(error);

      enqueueErrorSnackBar({
        message: graphqlMessage ?? t`Failed to upgrade the application.`,
      });

      return false;
    } finally {
      setIsUpgrading(false);
    }
  };

  return { planUpgrade, upgrade, isPlanning, isUpgrading };
};
