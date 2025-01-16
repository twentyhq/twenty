import { InformationBannerBillingSubscriptionPaused } from '@/information-banner/components/billing/InformationBannerBillingSubscriptionPaused';
import { InformationBannerFailPaymentInfo } from '@/information-banner/components/billing/InformationBannerFailPaymentInfo';
import { InformationBannerNoBillingSubscription } from '@/information-banner/components/billing/InformationBannerNoBillingSubscription';
import { InformationBannerReconnectAccountEmailAliases } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountEmailAliases';
import { InformationBannerReconnectAccountInsufficientPermissions } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountInsufficientPermissions';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-ui';
import { SubscriptionStatus } from '~/generated-metadata/graphql';

const StyledInformationBannerWrapper = styled.div`
  height: 40px;
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const InformationBannerWrapper = () => {
  const subscriptionStatus = useSubscriptionStatus();
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();

  const displayBillingSubscriptionPausedBanner =
    isWorkspaceSuspended && subscriptionStatus === SubscriptionStatus.Paused;

  const displayBillingSubscriptionCanceledBanner =
    isWorkspaceSuspended && !isDefined(subscriptionStatus);

  const displayFailPaymentInfoBanner =
    subscriptionStatus === SubscriptionStatus.PastDue ||
    subscriptionStatus === SubscriptionStatus.Unpaid;

  return (
    <StyledInformationBannerWrapper>
      <InformationBannerReconnectAccountInsufficientPermissions />
      <InformationBannerReconnectAccountEmailAliases />
      {displayBillingSubscriptionPausedBanner && (
        <InformationBannerBillingSubscriptionPaused />
      )}
      {displayBillingSubscriptionCanceledBanner && (
        <InformationBannerNoBillingSubscription />
      )}
      {displayFailPaymentInfoBanner && <InformationBannerFailPaymentInfo />}
    </StyledInformationBannerWrapper>
  );
};
