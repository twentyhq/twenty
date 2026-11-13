import { getMarketplaceAppConnectLink } from '@/marketplace/utils/getMarketplaceAppConnectLink';
import { useLingui } from '@lingui/react/macro';
import { IconPlug } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SettingsMarketplaceAppConnectButtonProps = {
  connectUrl: string;
};

export const SettingsMarketplaceAppConnectButton = ({
  connectUrl,
}: SettingsMarketplaceAppConnectButtonProps) => {
  const { t } = useLingui();

  return (
    <Button
      startIcon={<IconPlug />}
      variant="solid"
      color="accent"
      size="sm"
      nativeButton={false}
      role="link"
      render={
        <a
          href={getMarketplaceAppConnectLink({
            connectUrl,
            serverBaseUrl: REACT_APP_SERVER_BASE_URL,
          })}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    >{t`Connect`}</Button>
  );
};
