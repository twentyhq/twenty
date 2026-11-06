import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconCircleCheck, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  FindMarketplaceAppDetailDocument,
  GettingStartedStepActionKey,
  type MarketplaceApp,
} from '~/generated-metadata/graphql';

const StyledInstalledMark = styled.span`
  color: ${themeCssVariables.tag.text.green};
  display: flex;
`;

type GettingStartedAppInstallButtonProps = {
  item: Pick<MarketplaceApp, 'id' | 'name'>;
};

export const GettingStartedAppInstallButton = ({
  item: { id: universalIdentifier, name: appLabel },
}: GettingStartedAppInstallButtonProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { openDialog } = useDialog();
  const { updateGettingStarted } = useUpdateGettingStarted();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isInstalled =
    currentWorkspace?.installedApplications.some(
      (application) => application.universalIdentifier === universalIdentifier,
    ) ?? false;
  const { data } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier },
    skip: isInstalled,
  });
  const marketplaceAppDetail = data?.findMarketplaceAppDetail;
  const { install, isInstalling } = useInstallMarketplaceApp({
    universalIdentifier,
    onCompleted: () =>
      void updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.INSTALL_APP,
      }),
  });
  const modalInstanceId = `getting-started-install-${universalIdentifier}`;

  if (isInstalled) {
    return (
      <StyledInstalledMark role="img" aria-label={t`${appLabel} installed`}>
        <IconCircleCheck size={theme.icon.size.lg} />
      </StyledInstalledMark>
    );
  }

  return (
    <>
      <IconButton
        size="sm"
        aria-label={t`Install ${appLabel}`}
        loading={isInstalling}
        disabled={!isDefined(marketplaceAppDetail)}
        onClick={() => openDialog(modalInstanceId)}
      >
        <IconPlus />
      </IconButton>
      {isDefined(marketplaceAppDetail) && (
        <SettingsApplicationInstallPermissionValidationModal
          modalInstanceId={modalInstanceId}
          appDisplayName={marketplaceAppDetail.name}
          appLogoUrl={marketplaceAppDetail.logoUrl ?? undefined}
          defaultRole={getMarketplaceAppDefaultRoleManifest(
            marketplaceAppDetail,
          )}
          appObjects={marketplaceAppDetail.objects ?? undefined}
          requestedCapabilities={marketplaceAppDetail.requestedCapabilities}
          requestedIframeMediaPermissions={
            marketplaceAppDetail.requestedIframeMediaPermissions
          }
          billsCredits={marketplaceAppDetail.billsCredits}
          isListed={marketplaceAppDetail.isListed}
          onAuthorize={install}
          isInstalling={isInstalling}
        />
      )}
    </>
  );
};
