import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceAppWithPermissionValidation } from '@/marketplace/hooks/useInstallMarketplaceAppWithPermissionValidation';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowUpRight,
  IconCopy,
  IconDownload,
  IconInfoCircle,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FindMarketplaceAppDetailDocument } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

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

  const { requestInstall, install, isInstalling, modalInstanceId } =
    useInstallMarketplaceAppWithPermissionValidation();

  const installable =
    isDefined(isInstalled) && isDefined(universalIdentifier) && !isInstalled;

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: universalIdentifier ?? '' },
    skip: !installable || !isDefined(universalIdentifier),
  });

  const detail = detailData?.findMarketplaceAppDetail;
  const displayName = detail?.name ?? '';

  const defaultRole = getMarketplaceAppDefaultRoleManifest(detail);

  const handleInstall = async () => {
    if (installable) {
      await install({ universalIdentifier });
    }
  };

  return (
    <StyledButtonGroup>
      {installable && (
        <>
          <Button
            Icon={IconDownload}
            title={isInstalling ? t`Installing...` : t`Install`}
            variant={'secondary'}
            onClick={requestInstall}
            disabled={isInstalling}
          />
          <SettingsApplicationInstallPermissionValidationModal
            modalInstanceId={modalInstanceId}
            appDisplayName={displayName}
            appLogoUrl={detail?.logo ?? undefined}
            defaultRole={defaultRole}
            onAuthorize={handleInstall}
            isInstalling={isInstalling}
          />
        </>
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
