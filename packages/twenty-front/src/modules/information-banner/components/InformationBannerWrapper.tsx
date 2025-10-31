import { InformationBannerBillingSubscriptionPaused } from '@/information-banner/components/billing/InformationBannerBillingSubscriptionPaused';
import { InformationBannerEndTrialPeriod } from '@/information-banner/components/billing/InformationBannerEndTrialPeriod';
import { InformationBannerFailPaymentInfo } from '@/information-banner/components/billing/InformationBannerFailPaymentInfo';
import { InformationBannerNoBillingSubscription } from '@/information-banner/components/billing/InformationBannerNoBillingSubscription';
import { InformationBannerReconnectAccountEmailAliases } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountEmailAliases';
import { InformationBannerReconnectAccountInsufficientPermissions } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountInsufficientPermissions';
import { useIsSomeMeteredProductCapReached } from '@/workspace/hooks/useIsSomeMeteredProductCapReached';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

const StyledInformationBannerWrapper = styled.div`
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const InformationBannerWrapper = () => {
  const subscriptionStatus = useSubscriptionStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const isSomeMeteredProductCapReached = useIsSomeMeteredProductCapReached();

  const displayBillingSubscriptionPausedBanner =
    isWorkspaceSuspended && subscriptionStatus === SubscriptionStatus.Paused;

  const displayBillingSubscriptionCanceledBanner =
    isWorkspaceSuspended && !isDefined(subscriptionStatus);

  const displayFailPaymentInfoBanner =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;

  const displayEndTrialPeriodBanner =
    isSomeMeteredProductCapReached &&
    subscriptionStatus === SubscriptionStatus.Trialing;

  return (
    <StyledInformationBannerWrapper>
      <InformationBannerReconnectAccountInsufficientPermissions />
      <InformationBannerReconnectAccountEmailAliases />
      {displayBillingSubscriptionPausedBanner && (
        <InformationBannerBillingSubscriptionPaused /> // TODO: remove this once paused subscriptions are deprecated
      )}
      {displayBillingSubscriptionCanceledBanner && (
        <InformationBannerNoBillingSubscription />
      )}
      {displayFailPaymentInfoBanner && <InformationBannerFailPaymentInfo />}
      {displayEndTrialPeriodBanner && <InformationBannerEndTrialPeriod />}
    </StyledInformationBannerWrapper>
  );
};
