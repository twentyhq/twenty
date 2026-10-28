import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GETTING_STARTED_APP_CONTENT } from '@/getting-started/constants/GettingStartedAppContent';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { type GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import {
  FindMarketplaceAppDetailDocument,
  GettingStartedStep,
  GettingStartedStepStatus,
} from '~/generated-metadata/graphql';

type GettingStartedAppInstallButtonProps = {
  item: { id: (typeof GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS)[number] };
};

export const GettingStartedAppInstallButton = ({
  item: { id: universalIdentifier },
}: GettingStartedAppInstallButtonProps) => {
  const { t } = useLingui();
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
        stepStatus: {
          step: GettingStartedStep.INSTALL_APP,
          status: GettingStartedStepStatus.DONE,
        },
      }),
  });
  const appLabel = t(GETTING_STARTED_APP_CONTENT[universalIdentifier].label);
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
