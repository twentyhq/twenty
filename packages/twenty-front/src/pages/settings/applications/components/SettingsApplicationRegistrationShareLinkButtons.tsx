import { Button } from 'twenty-ui/input';
import {
  IconArrowUpRight,
  IconCopy,
  IconDownload,
  IconInfoCircle,
} from 'twenty-ui/display';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useLingui } from '@lingui/react/macro';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { isDefined } from 'twenty-shared/utils';

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationShareLinkButtons = ({
  shareLink,
  isInstalled,
  universalIdentifier,
  isNpmSource = false,
  withCopyButton = false,
}: {
  shareLink: string;
  isInstalled?: boolean;
  universalIdentifier?: string;
  isNpmSource?: boolean;
  withCopyButton?: boolean;
}) => {
  const { t } = useLingui();

  const { copyToClipboard } = useCopyToClipboard();

  const { install, isInstalling } = useInstallMarketplaceApp();

  const installable =
    isDefined(isInstalled) && isDefined(universalIdentifier) && !isInstalled;

  const handleInstall = async () => {
    if (installable) {
      await install({
        universalIdentifier,
      });
    }
  };

  return (
    <StyledButtonGroup>
      {installable && (
        <Button
          Icon={IconDownload}
          title={isInstalling ? t`Installing...` : t`Install`}
          variant={'secondary'}
          onClick={handleInstall}
          disabled={isInstalling}
        />
      )}
      {withCopyButton && (
        <Button
          Icon={IconCopy}
          title={t`Copy sharing link`}
          variant="secondary"
          disabled={!shareLink}
          onClick={async () => {
            if (shareLink) {
              await copyToClipboard(
                `${window.location.origin}${shareLink}`,
                t`Sharing link copied to clipboard`,
              );
            }
          }}
        />
      )}
      <Button
        Icon={isNpmSource ? IconArrowUpRight : IconInfoCircle}
        title={isNpmSource ? t`See on marketplace` : t`See app page`}
        variant="secondary"
        disabled={!shareLink}
        to={shareLink}
      />
    </StyledButtonGroup>
  );
};
