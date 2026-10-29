import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import {
  FindMarketplaceAppDetailDocument,
  type MarketplaceApp,
} from '~/generated-metadata/graphql';

type GettingStartedAppInstallButtonProps = {
  item: Pick<MarketplaceApp, 'id' | 'name'>;
};

export const GettingStartedAppInstallButton = ({
  item: { id: universalIdentifier, name: appLabel },
}: GettingStartedAppInstallButtonProps) => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const { refetch } = useGettingStartedProgress();
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
    onCompleted: () => void refetch(),
  });
  const modalInstanceId = `getting-started-install-${universalIdentifier}`;

  return (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        aria-label={t`Install ${appLabel}`}
        loading={isInstalling}
        disabled={isInstalled || !isDefined(marketplaceAppDetail)}
        onClick={() => openDialog(modalInstanceId)}
      >
        {isInstalled ? <IconCheck /> : <IconPlus />}
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
          billsCredits={marketplaceAppDetail.billsCredits}
          isVetted={marketplaceAppDetail.isVetted}
          onAuthorize={install}
          isInstalling={isInstalling}
        />
      )}
    </>
  );
};
