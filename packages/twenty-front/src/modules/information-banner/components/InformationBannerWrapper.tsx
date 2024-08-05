import { InformationBannerReconnectAccountEmailAliases } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountEmailAliases';
import { InformationBannerReconnectAccountInsufficientPermissions } from '@/information-banner/components/reconnect-account/InformationBannerReconnectAccountInsufficientPermissions';

export const InformationBannerWrapper = () => {
  return (
    <>
      <InformationBannerReconnectAccountEmailAliases />
      <InformationBannerReconnectAccountInsufficientPermissions />
    </>
  );
};
