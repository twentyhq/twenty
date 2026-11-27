import { isNonEmptyString } from '@sniptt/guards';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsApplicationConnectionProviderLogoProps = {
  connectionProvider: { displayName: string; logoUrl: string | null };
};

export const SettingsApplicationConnectionProviderLogo = ({
  connectionProvider: { displayName, logoUrl },
}: SettingsApplicationConnectionProviderLogoProps) => {
  if (!isNonEmptyString(logoUrl)) {
    return null;
  }

  return (
    <Avatar
      shape="square"
      variant="outline"
      size="md"
      src={getAbsoluteImageUrl(logoUrl)}
      name={displayName}
    />
  );
};
