import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { isNonEmptyString } from '@sniptt/guards';
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
import { Button } from 'twenty-ui/primitives/input';
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

  const installable =
    isDefined(isInstalled) && isDefined(universalIdentifier) && !isInstalled;

  const { requestInstall, install, isInstalling, modalInstanceId } =
    useInstallMarketplaceAppWithPermissionValidation({
      universalIdentifier,
    });

  const { data: detailData } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: universalIdentifier ?? '' },
    skip: !installable || !isDefined(universalIdentifier),
  });

  const detail = detailData?.findMarketplaceAppDetail;
  const displayName = detail?.name ?? '';

  const defaultRole = getMarketplaceAppDefaultRoleManifest(detail);

  return (
    <StyledButtonGroup>
      {installable && (
        <>
          <Button
            startIcon={<IconDownload />}
            onClick={requestInstall}
            disabled={isInstalling}
            variant="outline"
          >
            {isInstalling ? t`Installing...` : t`Install`}
          </Button>
          <SettingsApplicationInstallPermissionValidationModal
            modalInstanceId={modalInstanceId}
            appDisplayName={displayName}
            appLogoUrl={detail?.logoUrl ?? undefined}
            defaultRole={defaultRole}
            onAuthorize={install}
            isInstalling={isInstalling}
          />
        </>
      )}
      {withCopyButton && (
        <Button
          startIcon={<IconCopy />}
          disabled={!shareLink}
          onClick={async () => {
            if (shareLink) {
              await copyToClipboard(
                `${window.location.origin}${shareLink}`,
                t`Sharing link copied to clipboard`,
              );
            }
          }}
          variant="outline"
        >{t`Copy sharing link`}</Button>
      )}
      <NavigationButton
        startIcon={isNpmSource ? <IconArrowUpRight /> : <IconInfoCircle />}
        disabled={!shareLink}
        to={isNonEmptyString(shareLink) ? shareLink : undefined}
        variant="outline"
      >
        {isNpmSource ? t`See on marketplace` : t`See app page`}
      </NavigationButton>
    </StyledButtonGroup>
  );
};
