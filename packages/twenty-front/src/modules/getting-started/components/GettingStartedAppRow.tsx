import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { GETTING_STARTED_APP_CONTENT } from '@/getting-started/constants/GettingStartedAppContent';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { SettingsApplicationInstallPermissionValidationModal } from '@/marketplace/components/SettingsApplicationInstallPermissionValidationModal';
import { useInstallMarketplaceApp } from '@/marketplace/hooks/useInstallMarketplaceApp';
import { getMarketplaceAppDefaultRoleManifest } from '@/marketplace/utils/getMarketplaceAppDefaultRoleManifest';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { type GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { IconCheck, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { FindMarketplaceAppDetailDocument } from '~/generated-metadata/graphql';

const StyledAppRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAppText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledAppLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledAppDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type GettingStartedAppRowProps = {
  universalIdentifier: (typeof GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS)[number];
};

export const GettingStartedAppRow = ({
  universalIdentifier,
}: GettingStartedAppRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { openDialog } = useDialog();
  const { refetch } = useGettingStartedProgress();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isInstalled =
    currentWorkspace?.installedApplications.some(
      (application) => application.universalIdentifier === universalIdentifier,
    ) ?? false;
  const { data } = useQuery(FindMarketplaceAppDetailDocument, {
    variables: { universalIdentifier: universalIdentifier },
    skip: isInstalled,
  });
  const marketplaceAppDetail = data?.findMarketplaceAppDetail;
  const { install, isInstalling } = useInstallMarketplaceApp({
    universalIdentifier: universalIdentifier,
    onCompleted: () => void refetch(),
  });
  const { label, description, Icon } =
    GETTING_STARTED_APP_CONTENT[universalIdentifier];
  const appLabel = t(label);
  const modalInstanceId = `getting-started-install-${universalIdentifier}`;

  return (
    <>
      <StyledAppRow>
        <Icon size={theme.icon.size.lg} />
        <StyledAppText>
          <StyledAppLabel>{appLabel}</StyledAppLabel>
          <StyledAppDescription>{t(description)}</StyledAppDescription>
        </StyledAppText>
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
      </StyledAppRow>
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
