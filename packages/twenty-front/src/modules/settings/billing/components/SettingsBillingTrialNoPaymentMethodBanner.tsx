import { useSnackBarOnQueryError } from '@/apollo/hooks/useSnackBarOnQueryError';
import { type CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { usePermissionFlagMap } from '@/settings/roles/hooks/usePermissionFlagMap';
import { useQuery } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/feedback';
import {
  BillingPlanKey,
  BillingPortalSessionDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { formatDate } from '~/utils/date-utils';

type SettingsBillingTrialNoPaymentMethodBannerProps = {
  currentBillingSubscription: NonNullable<
    CurrentWorkspace['currentBillingSubscription']
  >;
};

export const SettingsBillingTrialNoPaymentMethodBanner = ({
  currentBillingSubscription,
}: SettingsBillingTrialNoPaymentMethodBannerProps) => {
  const { redirect } = useRedirect();

  const { [PermissionFlagType.BILLING]: hasPermissionToManageBilling } =
    usePermissionFlagMap();

  const { data, error } = useQuery(BillingPortalSessionDocument, {
    variables: {
      returnUrlPath: getSettingsPath(SettingsPath.Billing),
      forPaymentMethodUpdate: true,
    },
    skip: !hasPermissionToManageBilling,
  });

  useSnackBarOnQueryError(error);

  const openPaymentMethodUpdate = () => {
    if (isDefined(data?.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  const planName =
    currentBillingSubscription.metadata?.['plan'] === BillingPlanKey.PRO
      ? t`pro plan`
      : t`organization plan`;

  const trialEndDate = isDefined(currentBillingSubscription.currentPeriodEnd)
    ? formatDate(currentBillingSubscription.currentPeriodEnd, 'MMM dd')
    : undefined;

  const message = isDefined(trialEndDate)
    ? hasPermissionToManageBilling
      ? t`Trial ends ${trialEndDate}, please add card details to keep the ${planName}`
      : t`Trial ends ${trialEndDate}. Please contact your admin to add card details to keep the ${planName}`
    : hasPermissionToManageBilling
      ? t`Trial ends soon, please add card details to keep the ${planName}`
      : t`Trial ends soon. Please contact your admin to add card details to keep the ${planName}`;

  return (
    <InlineBanner
      color="blue"
      message={message}
      button={{
        title: t`Add card`,
        hidden: !hasPermissionToManageBilling,
        onClick: openPaymentMethodUpdate,
      }}
    />
  );
};
