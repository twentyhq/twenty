import { RefetchOnWindowFocusEffect } from '@/apollo/components/RefetchOnWindowFocusEffect';
import { SettingsBuiltInMcpClientAppConnectionRowDropdownMenu } from '@/settings/app-preferences/components/SettingsBuiltInMcpClientAppConnectionRowDropdownMenu';
import { SettingsBuiltInMcpClientAppPermissionsCell } from '@/settings/app-preferences/components/SettingsBuiltInMcpClientAppPermissionsCell';
import { type BuiltInMcpClientApp } from '@/settings/app-preferences/types/BuiltInMcpClientApp';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { openUrlInNewTab } from '~/utils/openUrlInNewTab';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledAddConnectionContainer = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledConnectCardContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type SettingsBuiltInMcpClientAppConnectionsSectionProps = {
  app: BuiltInMcpClientApp;
  connectLink: string | undefined;
  authorizations: BuiltInMcpClientAppAuthorization[];
  loading: boolean;
  refetch: () => Promise<unknown>;
};

export const SettingsBuiltInMcpClientAppConnectionsSection = ({
  app,
  connectLink,
  authorizations,
  loading,
  refetch,
}: SettingsBuiltInMcpClientAppConnectionsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const appName = t(app.name);
  const isConnectDisabled = !isDefined(connectLink);

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (authorizations.length === 0) {
      return (
        <Tooltip
          content={t`${appName} needs this server to use HTTPS.`}
          side="bottom"
          positionMethod="fixed"
          delay={TooltipDelay.shortDelay}
          disabled={!isConnectDisabled}
        >
          <StyledConnectCardContainer>
            <SettingsCard
              Icon={<app.Icon size={theme.icon.size.md} />}
              title={t`Connect with ${appName}`}
              href={connectLink}
              disabled={isConnectDisabled}
            />
          </StyledConnectCardContainer>
        </Tooltip>
      );
    }

    return (
      <>
        <Table>
          <SettingsApplicationTableHeaderRow
            middleColumn="status"
            nameLabel={t`Connection`}
            detailsLabel={t`Permissions`}
            detailsAlign="left"
            shouldShowDetailsOnMobile
          />
          <StyledTableRows>
            {authorizations.map((authorization) => (
              <SettingsApplicationTableRow
                key={authorization.id}
                middleColumn="status"
                hasActionMenu
                name={
                  <>
                    <app.Icon size={theme.icon.size.md} />
                    <OverflowingTextWithTooltip text={appName} />
                  </>
                }
                middle={
                  <Status color="green" weight="medium">{t`Connected`}</Status>
                }
                details={
                  <SettingsBuiltInMcpClientAppPermissionsCell
                    authorization={authorization}
                  />
                }
                detailsAlign="left"
                shouldShowDetailsOnMobile
                action={
                  <SettingsBuiltInMcpClientAppConnectionRowDropdownMenu
                    applicationAuthorizationId={authorization.id}
                    appName={appName}
                    onDisconnected={refetch}
                  />
                }
              />
            ))}
          </StyledTableRows>
        </Table>
        {isDefined(connectLink) && (
          <StyledAddConnectionContainer>
            <Button
              startIcon={<IconPlus />}
              size="sm"
              variant="outline"
              onClick={() => openUrlInNewTab(connectLink)}
            >{t`Add connection`}</Button>
          </StyledAddConnectionContainer>
        )}
      </>
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
