import { RefetchOnWindowFocusEffect } from '@/apollo/components/RefetchOnWindowFocusEffect';
import { AppChip } from '@/applications/components/AppChip';
import { SettingsConnectableAppConnectTooltip } from '@/settings/app-preferences/components/SettingsConnectableAppConnectTooltip';
import { useConnectableAppAuthorizations } from '@/settings/app-preferences/hooks/useConnectableAppAuthorizations';
import { useConnectableAppConnectLink } from '@/settings/app-preferences/hooks/useConnectableAppConnectLink';
import { type ConnectableApp } from '@/settings/app-preferences/types/ConnectableApp';
import { SettingsApplicationAuthorizationRowDropdownMenu } from '@/settings/applications/components/SettingsApplicationAuthorizationRowDropdownMenu';
import { SettingsApplicationAuthorizationPermissionsCell } from '@/settings/applications/components/SettingsApplicationAuthorizationPermissionsCell';
import { SettingsApplicationLoadErrorBanner } from '@/settings/applications/components/SettingsApplicationLoadErrorBanner';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { styled } from '@linaria/react';
import { useMutation } from '@apollo/client/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { Status } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { RevokeApplicationAuthorizationDocument } from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledConnectCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type SettingsConnectableAppConnectionsSectionProps = {
  connectableApp: ConnectableApp;
};

export const SettingsConnectableAppConnectionsSection = ({
  connectableApp,
}: SettingsConnectableAppConnectionsSectionProps) => {
  const { t } = useLingui();
  const { authorizations, loading, hasLoadError, refetch } =
    useConnectableAppAuthorizations(connectableApp);
  const connectLink = useConnectableAppConnectLink(connectableApp);
  const [revokeApplicationAuthorization] = useMutation(
    RevokeApplicationAuthorizationDocument,
  );

  const appName = connectableApp.name;
  const isConnectDisabled = !isDefined(connectLink);
  const appChip = (
    <AppChip
      logoUrl={connectableApp.logoUrl}
      fallbackApplicationData={{ name: appName }}
      chipOnly
    />
  );

  const [latestAuthorization] = authorizations;

  const disconnect = async () => {
    const revokeResults = await Promise.allSettled(
      authorizations.map(({ id }) =>
        revokeApplicationAuthorization({
          variables: { applicationAuthorizationId: id },
        }),
      ),
    );

    const failedRevoke = revokeResults.find(
      (revokeResult) => revokeResult.status === 'rejected',
    );

    if (isDefined(failedRevoke)) {
      await refetch().catch(() => undefined);

      throw failedRevoke.reason;
    }

    await refetch();
  };

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (hasLoadError) {
      return (
        <SettingsApplicationLoadErrorBanner
          message={t`Your connections could not be loaded. Check your connection and try again.`}
          onRetry={() => refetch().catch(() => undefined)}
        />
      );
    }

    if (!isDefined(latestAuthorization)) {
      return (
        <SettingsConnectableAppConnectTooltip
          appName={appName}
          isConnectDisabled={isConnectDisabled}
        >
          <StyledConnectCardContainer>
            <SettingsCard
              Icon={appChip}
              title={t`Connect with ${appName}`}
              href={connectLink}
              disabled={isConnectDisabled}
            />
          </StyledConnectCardContainer>
        </SettingsConnectableAppConnectTooltip>
      );
    }

    const lastUsed = beautifyPastDateRelativeToNowShort(
      latestAuthorization.lastUsedAt,
    );

    return (
      <Table>
        <SettingsApplicationTableHeaderRow
          middleColumn="status"
          nameLabel={t`Connection`}
          detailsLabel={t`Permissions`}
          detailsAlign="left"
          shouldShowDetailsOnMobile
        />
        <StyledTableRows>
          <SettingsApplicationTableRow
            middleColumn="status"
            hasActionMenu
            name={
              <>
                {appChip}
                <OverflowingTextWithTooltip text={t`Last used ${lastUsed}`} />
              </>
            }
            middle={
              <Status color="green" weight="medium">{t`Connected`}</Status>
            }
            details={
              <SettingsApplicationAuthorizationPermissionsCell
                authorizations={authorizations}
              />
            }
            detailsAlign="left"
            shouldShowDetailsOnMobile
            action={
              <SettingsApplicationAuthorizationRowDropdownMenu
                applicationAuthorizationId={latestAuthorization.id}
                revokeLabel={t`Disconnect`}
                confirmationTitle={t`Disconnect ${appName}?`}
                confirmationSubtitle={
                  <Trans>
                    {appName} will lose access to this workspace when its
                    current access token expires.
                  </Trans>
                }
                onRevoke={disconnect}
              />
            }
          />
        </StyledTableRows>
      </Table>
    );
  };

  return (
    <Section.Root>
      <RefetchOnWindowFocusEffect refetch={refetch} />
      <Section.Header
        title={t`Connections`}
        description={t`${appName} acts as you in this workspace, with the permissions of your role.`}
      />
      {renderContent()}
    </Section.Root>
  );
};
