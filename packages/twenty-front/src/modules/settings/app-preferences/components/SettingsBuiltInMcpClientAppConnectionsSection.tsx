import { RefetchOnWindowFocusEffect } from '@/apollo/components/RefetchOnWindowFocusEffect';
import { SettingsBuiltInMcpClientAppConnectTooltip } from '@/settings/app-preferences/components/SettingsBuiltInMcpClientAppConnectTooltip';
import { useBuiltInMcpClientAppConnectLink } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppConnectLink';
import { SettingsApplicationAuthorizationRowDropdownMenu } from '@/settings/applications/components/SettingsApplicationAuthorizationRowDropdownMenu';
import { SettingsApplicationAuthorizationPermissionsCell } from '@/settings/applications/components/SettingsApplicationAuthorizationPermissionsCell';
import { useBuiltInMcpClientAppAuthorizations } from '@/settings/app-preferences/hooks/useBuiltInMcpClientAppAuthorizations';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
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
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  CurrentUserApplicationAuthorizationsDocument,
  RevokeApplicationAuthorizationDocument,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNowShort } from '~/utils/date-utils';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledConnectCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type SettingsBuiltInMcpClientAppConnectionsSectionProps = {
  app: BuiltInMcpClientApp;
};

export const SettingsBuiltInMcpClientAppConnectionsSection = ({
  app,
}: SettingsBuiltInMcpClientAppConnectionsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { authorizations, loading, hasLoadError, refetch } =
    useBuiltInMcpClientAppAuthorizations(app);
  const connectLink = useBuiltInMcpClientAppConnectLink(app);
  const [revokeApplicationAuthorization] = useMutation(
    RevokeApplicationAuthorizationDocument,
    {
      refetchQueries: [{ query: CurrentUserApplicationAuthorizationsDocument }],
      awaitRefetchQueries: true,
    },
  );

  const appName = t(app.name);
  const isConnectDisabled = !isDefined(connectLink);

  // A member has one grant per install, plus one on an install made before ChatGPT and Claude were shared;
  // to them it is one connection, so it reads and disconnects as one
  const [latestAuthorization] = [...authorizations].sort(
    (first, second) =>
      new Date(second.lastUsedAt).getTime() -
      new Date(first.lastUsedAt).getTime(),
  );

  const getLastUsedLabel = (
    authorization: BuiltInMcpClientAppAuthorization,
  ) => {
    const lastUsed = beautifyPastDateRelativeToNowShort(
      authorization.lastUsedAt,
    );

    return t`Last used ${lastUsed}`;
  };

  const disconnect = () =>
    Promise.all(
      authorizations.map(({ id }) =>
        revokeApplicationAuthorization({
          variables: { applicationAuthorizationId: id },
        }),
      ),
    );

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
        <SettingsBuiltInMcpClientAppConnectTooltip
          appName={appName}
          isConnectDisabled={isConnectDisabled}
        >
          <StyledConnectCardContainer>
            <SettingsCard
              Icon={<app.Icon size={theme.icon.size.md} />}
              title={t`Connect with ${appName}`}
              href={connectLink}
              disabled={isConnectDisabled}
            />
          </StyledConnectCardContainer>
        </SettingsBuiltInMcpClientAppConnectTooltip>
      );
    }

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
                <app.Icon size={theme.icon.size.md} />
                <OverflowingTextWithTooltip
                  text={getLastUsedLabel(latestAuthorization)}
                />
              </>
            }
            middle={
              <Status color="green" weight="medium">{t`Connected`}</Status>
            }
            details={
              <SettingsApplicationAuthorizationPermissionsCell
                authorization={latestAuthorization}
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
