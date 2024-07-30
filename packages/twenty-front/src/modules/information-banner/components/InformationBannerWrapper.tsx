import { InformationBannerAccountToReconnect } from '@/information-banner/components/InformationBannerReconnectAccount';

export enum InformationBannerKeys {
  ACCOUNTS_TO_RECONNECT = 'ACCOUNTS_TO_RECONNECT',
}

export const InformationBannerWrapper = () => {
  return (
    <>
      <InformationBannerAccountToReconnect />
    </>
  );
};
