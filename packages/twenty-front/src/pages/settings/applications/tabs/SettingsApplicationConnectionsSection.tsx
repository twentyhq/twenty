import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Avatar, Status } from 'twenty-ui/data-display';
import { Info } from 'twenty-ui/feedback';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useApplicationConnectedAccounts } from '~/pages/settings/applications/hooks/useApplicationConnectedAccounts';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 160px 180px 36px';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

export const SettingsApplicationConnectionsSection = ({
  applicationId,
}: {
  applicationId: string;
}) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);
  const { accounts: connectedAccounts, loading: accountsLoading } =
    useApplicationConnectedAccounts(applicationId);

  if (loading || accountsLoading || connectionProviders.length === 0) {
    return null;
  }

  return (
    <>
      {connectionProviders.map((provider) => {
        const isOAuth = provider.type === 'oauth';
        const isClientCredentialsConfigured =
          provider.oauth?.isClientCredentialsConfigured ?? false;

        const providerConnections = connectedAccounts.filter(
          (account) => account.connectionProviderId === provider.id,
        );

        return (
          <Section key={provider.id}>
            <H2Title
              title={provider.displayName}
              description={t`Manage connections used by this app to call ${provider.displayName}.`}
              adornment={
                <Avatar
                  type="app"
                  avatarUrl={getAbsoluteImageUrl(provider.logoUrl)}
                  placeholder={provider.displayName}
                />
              }
            />
            {isOAuth && !isClientCredentialsConfigured && (
              <Info
                accent="danger"
                text={t`${provider.displayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add a connection.`}
              />
            )}
            {providerConnections.length > 0 && (
              <Table>
                <TableRow
                  gridTemplateColumns={
                    CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                  }
                >
                  <TableHeader>{t`Connection`}</TableHeader>
                  <TableHeader>{t`Status`}</TableHeader>
                  <TableHeader>{t`Visibility`}</TableHeader>
                  <TableHeader />
                </TableRow>
                <StyledTableRowsContainer>
                  {providerConnections.map((connection) => (
                    <TableRow
                      key={connection.id}
                      gridTemplateColumns={
                        CONNECTION_TABLE_ROW_GRID_TEMPLATE_COLUMNS
                      }
                      to={getSettingsPath(
                        SettingsPath.ApplicationConnectionDetail,
                        {
                          applicationId,
                          connectedAccountId: connection.id,
                        },
                      )}
                    >
                      <TableCell
                        clickable
                        minWidth="0"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                      >
                        {connection.name ?? connection.handle}
                      </TableCell>
                      <TableCell clickable>
                        {connection.authFailedAt ? (
                          <Status color="red">{t`Reconnect needed`}</Status>
                        ) : (
                          <Status color="green">{t`Connected`}</Status>
                        )}
                      </TableCell>
                      <TableCell clickable>
                        <Status
                          color={
                            connection.visibility === 'workspace'
                              ? 'blue'
                              : 'gray'
                          }
                        >
                          {connection.visibility === 'workspace'
                            ? t`Workspace shared`
                            : t`Just for me`}
                        </Status>
                      </TableCell>
                      <TableCell
                        align="right"
                        color={themeCssVariables.font.color.tertiary}
                        padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
                      >
                        <IconChevronRight
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                          color={theme.font.color.light}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </StyledTableRowsContainer>
              </Table>
            )}
            {isClientCredentialsConfigured && (
              <StyledFooter>
                <Button
                  title={t`Add connection`}
                  Icon={IconPlus}
                  variant="secondary"
                  accent="default"
                  size="small"
                  onClick={() =>
                    triggerAppOAuth({
                      applicationId,
                      providerName: provider.name,
                      visibility: 'workspace',
                    })
                  }
                />
              </StyledFooter>
            )}
          </Section>
        );
      })}
    </>
  );
};
