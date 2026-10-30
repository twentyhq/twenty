import { RefetchOnWindowFocusEffect } from '@/apollo/components/RefetchOnWindowFocusEffect';
import { AppChip } from '@/applications/components/AppChip';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { SettingsBuiltInMcpClientAppConnectionRowDropdownMenu } from '@/settings/app-preferences/components/SettingsBuiltInMcpClientAppConnectionRowDropdownMenu';
import { type BuiltInMcpClientAppAuthorization } from '@/settings/app-preferences/types/BuiltInMcpClientAppAuthorization';
import { SettingsApplicationTableHeaderRow } from '@/settings/applications/components/SettingsApplicationTableHeaderRow';
import { SettingsApplicationTableRow } from '@/settings/applications/components/SettingsApplicationTableRow';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconPlus } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
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

type SettingsBuiltInMcpClientAppConnectionsSectionProps = {
  appName: string;
  logoUrl: string;
  connectLink: string | undefined;
  authorizations: BuiltInMcpClientAppAuthorization[];
  loading: boolean;
  refetch: () => Promise<unknown>;
};

export const SettingsBuiltInMcpClientAppConnectionsSection = ({
  appName,
  logoUrl,
  connectLink,
  authorizations,
  loading,
  refetch,
}: SettingsBuiltInMcpClientAppConnectionsSectionProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const renderContent = () => {
    if (loading) {
      return <SettingsSectionSkeletonLoader />;
    }

    if (authorizations.length === 0) {
      return (
        <SettingsCard
          Icon={<AppChip logoUrl={logoUrl} size="md" chipOnly />}
          title={t`Connect with ${appName}`}
          description={
            isDefined(connectLink)
              ? undefined
              : t`${appName} needs this server to use HTTPS.`
          }
          href={connectLink}
          disabled={!isDefined(connectLink)}
        />
      );
    }

    return (
      <>
        <Table>
          <SettingsApplicationTableHeaderRow
            middleColumn="status"
            nameLabel={t`Connection`}
            detailsLabel={t`Last active`}
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
                    <AppChip logoUrl={logoUrl} size="md" chipOnly />
                    <OverflowingTextWithTooltip text={appName} />
                  </>
                }
                middle={
                  <Status color="green" weight="medium">{t`Connected`}</Status>
                }
                details={
                  <OverflowingTextWithTooltip
                    text={beautifyPastDateRelativeToNow(
                      authorization.lastUsedAt,
                      localeCatalog,
                    )}
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
