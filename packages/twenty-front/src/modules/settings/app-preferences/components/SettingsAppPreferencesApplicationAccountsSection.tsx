import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsAppPreferencesApplicationAccountDropdownMenu } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountDropdownMenu';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { IconAt, IconPlus } from 'twenty-ui/icon';
import { Avatar, Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { useFindApplicationConnectionProviders } from '~/pages/settings/applications/hooks/useFindApplicationConnectionProviders';
import { useTriggerAppOAuth } from '~/pages/settings/applications/hooks/useTriggerAppOAuth';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) auto 36px';

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

type SettingsAppPreferencesApplicationAccountsSectionProps = {
  applicationId: string;
  accounts: ConnectedAccount[];
};

// The member's own accounts for an app: the ones they connected through the
// app's OAuth providers, which the app uses when acting on their behalf.
export const SettingsAppPreferencesApplicationAccountsSection = ({
  applicationId,
  accounts,
}: SettingsAppPreferencesApplicationAccountsSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { triggerAppOAuth } = useTriggerAppOAuth();
  const { connectionProviders, loading } =
    useFindApplicationConnectionProviders(applicationId);

  const oauthProviders = connectionProviders.filter(
    (provider) => provider.type === 'oauth',
  );

  if (loading || oauthProviders.length === 0) {
    return null;
  }

  const redirectLocation = getSettingsPath(
    SettingsPath.AppPreferencesApplication,
    { applicationId },
  );

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`The accounts this app uses on your behalf.`}
      />
      {oauthProviders.map((provider) =>
        provider.oauth?.isClientCredentialsConfigured === false ? (
          <InlineBanner
            key={provider.id}
            variant="compact"
            color="danger"
            message={t`${provider.displayName} OAuth is not yet set up by your server administrator. They need to fill in the OAuth client ID and secret on the application registration before you can add an account.`}
          />
        ) : null,
      )}
      {accounts.length === 0 ? (
        <InlineBanner
          variant="compact"
          color="blue"
          message={t`Connect an account so this app can act on your behalf.`}
        />
      ) : (
        <Table>
          <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableHeader>{t`Account`}</TableHeader>
            <TableHeader align="right">{t`Status`}</TableHeader>
            <TableHeader />
          </TableRow>
          <StyledTableRowsContainer>
            {accounts.map((account) => {
              const provider = connectionProviders.find(
                ({ id }) => id === account.connectionProviderId,
              );

              return (
                <TableRow
                  key={account.id}
                  gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
                >
                  <TableCell
                    color={themeCssVariables.font.color.primary}
                    gap={themeCssVariables.spacing[2]}
                    minWidth="0"
                    overflow="hidden"
                  >
                    {isDefined(provider) &&
                    isNonEmptyString(provider.logoUrl) ? (
                      <Avatar
                        shape="square"
                        variant="outline"
                        size="md"
                        src={getAbsoluteImageUrl(provider.logoUrl)}
                        name={provider.displayName}
                      />
                    ) : (
                      <IconAt
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                      />
                    )}
                    <OverflowingTextWithTooltip
                      text={account.name ?? account.handle}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isDefined(account.authFailedAt) ? (
                      <Status color="red" weight="medium">
                        {t`Reconnect needed`}
                      </Status>
                    ) : (
                      <Status color="green" weight="medium">
                        {t`Connected`}
                      </Status>
                    )}
                  </TableCell>
                  <TableCell align="right" padding="0">
                    <SettingsAppPreferencesApplicationAccountDropdownMenu
                      account={account}
                      redirectLocation={redirectLocation}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </StyledTableRowsContainer>
        </Table>
      )}
      <StyledFooter>
        {oauthProviders.map((provider) => (
          <Button
            key={provider.id}
            startIcon={<IconPlus />}
            size="sm"
            variant="outline"
            disabled={provider.oauth?.isClientCredentialsConfigured !== true}
            onClick={() =>
              triggerAppOAuth({
                applicationId,
                providerName: provider.name,
                visibility: 'user',
                redirectLocation,
              })
            }
          >
            {oauthProviders.length > 1
              ? t`Connect ${provider.displayName}`
              : t`Add Account`}
          </Button>
        ))}
      </StyledFooter>
    </Section.Root>
  );
};
