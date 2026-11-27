import { isNonEmptyString } from '@sniptt/guards';
import { StackIcon } from 'twenty-ui/components/data-display';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type SettingsApplicationConnectionProviderLogoProps = {
  connectionProvider: {
    displayName: string;
    logoUrl: string | null;
    via?: { name: string; logoUrl: string | null } | null;
  };
};

export const SettingsApplicationConnectionProviderLogo = ({
  connectionProvider: { displayName, logoUrl, via },
}: SettingsApplicationConnectionProviderLogoProps) => {
  if (!isNonEmptyString(logoUrl)) {
    return null;
  }

  const providerLogo = (
    <Avatar
      shape="square"
      variant="outline"
      size="md"
      src={getAbsoluteImageUrl(logoUrl)}
      name={displayName}
    />
  );

  if (!isNonEmptyString(via?.logoUrl)) {
    return providerLogo;
  }

  return (
    <StackIcon
      icon={providerLogo}
      stackedIcon={
        <Avatar
          shape="square"
          variant="outline"
          size="xs"
          src={getAbsoluteImageUrl(via.logoUrl)}
          name={via.name}
        />
      }
    />
  );
};
