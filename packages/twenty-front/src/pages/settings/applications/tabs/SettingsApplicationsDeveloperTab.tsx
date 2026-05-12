import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { SettingsPublicDomainsListCard } from '@/settings/domains/components/SettingsPublicDomainsListCard';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  CommandBlock,
  H2Title,
  IconArrowUpRight,
  IconChevronRight,
  IconCopy,
  InlineBanner,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  type ApplicationRegistrationFragmentFragment,
  FindManyApplicationRegistrationsDocument,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useMarketplaceApps } from '~/modules/marketplace/hooks/useMarketplaceApps';
import {
  APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { getApplicationDescriptionSummary } from '~/pages/settings/applications/utils/getApplicationDescriptionSummary';
import { ApplicationDisplay } from '@/applications/components/ApplicationDisplay';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsEmailingDomains } from '~/pages/settings/emailing-domains/SettingsEmailingDomains';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const NPM_PACKAGES_GRID_COLUMNS = '200px 1fr 36px';

export const SettingsApplicationsDeveloperTab = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const [displayNotVettedApps, setDisplayNotVettedApps] = useState(false);

  const { copyToClipboard } = useCopyToClipboard();

  const { data } = useQuery(FindManyApplicationRegistrationsDocument);

  const isMarketplaceSettingTabVisible = useIsFeatureEnabled(
    FeatureFlagKey.IS_MARKETPLACE_SETTING_TAB_VISIBLE,
  );

  const isPublicDomainEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_PUBLIC_DOMAIN_ENABLED,
  );
  const isEmailingDomainEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_EMAILING_DOMAIN_ENABLED,
  );

  const [marketplaceAppSearchTerm, setMarketplaceAppSearchTerm] = useState('');

  const [myAppsSearchTerm, setMyAppsSearchTerm] = useState('');

  const { data: marketplaceApps } = useMarketplaceApps();

  const filteredMarketplaceApps = useMemo(() => {
    if (!marketplaceAppSearchTerm) {
      return marketplaceApps;
    }

    const lowerSearch = marketplaceAppSearchTerm.toLowerCase();

    return marketplaceApps.filter(
      (application) =>
        application.name.toLowerCase().includes(lowerSearch) ||
        application.description.toLowerCase().includes(lowerSearch),
    );
  }, [marketplaceApps, marketplaceAppSearchTerm]);

  const registrations: ApplicationRegistrationFragmentFragment[] =
    data?.findManyApplicationRegistrations ?? [];

  const createCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const createCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          createCommands.join('\n'),
          t`Commands copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy commands`}
      Icon={IconCopy}
    />
  );

  const getRegistrationLink = (
    registration: ApplicationRegistrationFragmentFragment,
  ) =>
    getSettingsPath(SettingsPath.ApplicationRegistrationDetail, {
      applicationRegistrationId: registration.id,
    });

  return (
    <>
      <Section>
        <H2Title
          title={t`Create an application`}
          description={t`You can either create a private app or share it to others`}
        />
        <CommandBlock commands={createCommands} button={createCopyButton} />
        <StyledButtonContainer>
          <Button
            Icon={IconArrowUpRight}
            variant={'secondary'}
            size={'small'}
            title={t`Read documentation`}
            onClick={() =>
              window.open(
                getDocumentationUrl({
                  locale: currentWorkspaceMember?.locale,
                  path: '/developers/extend/apps/getting-started',
                }),
                '_blank',
              )
            }
          />
        </StyledButtonContainer>
      </Section>

      {registrations.length > 0 && (
        <Section>
          <H2Title
            title={t`My apps`}
            description={t`Apps you're the developer of`}
          />
          <StyledSearchInputContainer>
            <SearchInput
              placeholder={t`Search an application`}
              value={myAppsSearchTerm}
              onChange={setMyAppsSearchTerm}
            />
          </StyledSearchInputContainer>
          <Table>
            <TableRow
              gridTemplateColumns={APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
            >
              <TableHeader> {t`Name`}</TableHeader>
              <TableHeader>{''}</TableHeader>
              <TableHeader>{''}</TableHeader>
              <TableHeader />
            </TableRow>
            <StyledTableRowsContainer>
              {registrations.map((registration) => {
                return (
                  <SettingsApplicationTableRow
                    key={registration.id}
                    application={registration}
                    action={
                      <IconChevronRight
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                        color={theme.font.color.light}
                      />
                    }
                    link={getRegistrationLink(registration)}
                  />
                );
              })}
            </StyledTableRowsContainer>
          </Table>
        </Section>
      )}

      {isEmailingDomainEnabled && (
        <Section>
          <H2Title
            title={t`Emailing Domains`}
            description={t`Configure and verify domains for emailing from this workspace.`}
          />
          <SettingsEmailingDomains />
        </Section>
      )}

      {isPublicDomainEnabled && (
        <Section>
          <H2Title
            title={t`Public Domains`}
            description={t`Provision a complete and secure hosting environment on these domains. Bind a domain to a specific app to expose only that app's HTTP routes.`}
          />
          <SettingsPublicDomainsListCard />
        </Section>
      )}

      {!isMarketplaceSettingTabVisible && (
        <Section>
          <H2Title
            title={t`NPM packages`}
            description={t`Apps made by other developers published on npm`}
          />
          <InlineBanner
            color={'danger'}
            message={t`These apps are not vetted. Use at your own risk.`}
            button={{
              title: t`Access`,
              hidden: displayNotVettedApps,
              onClick: () => setDisplayNotVettedApps(true),
            }}
          />
          {displayNotVettedApps && (
            <>
              <StyledSearchInputContainer>
                <SearchInput
                  placeholder={t`Search an application`}
                  value={marketplaceAppSearchTerm}
                  onChange={setMarketplaceAppSearchTerm}
                />
              </StyledSearchInputContainer>
              {filteredMarketplaceApps.length === 0 ? (
                <SettingsEmptyPlaceholder>{t`No application found`}</SettingsEmptyPlaceholder>
              ) : (
                <Table>
                  <TableRow gridAutoColumns={NPM_PACKAGES_GRID_COLUMNS}>
                    <TableHeader>{t`Name`}</TableHeader>
                    <TableHeader>{t`Description`}</TableHeader>
                    <TableHeader />
                  </TableRow>
                  <StyledTableRowsContainer>
                    {filteredMarketplaceApps.map((application) => (
                      <TableRow
                        key={application.id}
                        gridAutoColumns={NPM_PACKAGES_GRID_COLUMNS}
                        to={getSettingsPath(
                          SettingsPath.AvailableApplicationDetail,
                          {
                            availableApplicationId: application.id,
                          },
                        )}
                      >
                        <StyledNameTableCell>
                          <ApplicationDisplay application={application} />
                        </StyledNameTableCell>
                        <TableCell
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          <OverflowingTextWithTooltip
                            text={getApplicationDescriptionSummary(
                              application.description,
                            )}
                          />
                        </TableCell>
                        <StyledActionTableCell>
                          <IconChevronRight
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                            color={theme.font.color.light}
                          />
                        </StyledActionTableCell>
                      </TableRow>
                    ))}
                  </StyledTableRowsContainer>
                </Table>
              )}
            </>
          )}
        </Section>
      )}
    </>
  );
};
