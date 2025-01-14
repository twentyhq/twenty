import { InformationBannerBillingSubscriptionPaused } from '@/information-banner/components/billing/InformationBannerBillingSubscriptionPaused';
import { InformationBannerNoBillingSubscription } from '@/information-banner/components/billing/InformationBannerNoBillingSubscription';
import { InformationBannerReconnectAccountEmailAliases } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountEmailAliases';
import { InformationBannerReconnectAccountInsufficientPermissions } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountInsufficientPermissions';
import styled from '@emotion/styled';

const StyledInformationBannerWrapper = styled.div`
  height: 40px;
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const InformationBannerWrapper = () => {
  return (
    <StyledInformationBannerWrapper>
      <InformationBannerReconnectAccountInsufficientPermissions />
      <InformationBannerReconnectAccountEmailAliases />
      <InformationBannerBillingSubscriptionPaused />
      <InformationBannerNoBillingSubscription />
    </StyledInformationBannerWrapper>
  );
};
