import { InformationBannerReconnectAccountEmailAliases } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountEmailAliases';
import { InformationBannerReconnectAccountInsufficientPermissions } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountInsufficientPermissions';
import styled from '@emotion/styled';

const StyledInformationBannerWrapper = styled.div`
  height: 40px;
  position: relative;
`;

export const InformationBannerWrapper = () => {
  return (
    <StyledInformationBannerWrapper>
      <InformationBannerReconnectAccountInsufficientPermissions />
      <InformationBannerReconnectAccountEmailAliases />
    </StyledInformationBannerWrapper>
  );
};
