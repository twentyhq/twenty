import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
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
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/components';
import {
  Avatar,
  CommandBlock,
  H2Title,
  IconApps,
  IconChevronRight,
  IconCopy,
  IconFileInfo,
  OverflowingTextWithTooltip,
  InlineBanner,
} from 'twenty-ui/display';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
  FeatureFlagKey,
  FindManyApplicationRegistrationsDocument,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useMarketplaceApps } from '~/modules/marketplace/hooks/useMarketplaceApps';

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledTableRowsContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const NPM_PACKAGES_GRID_COLUMNS = '200px 1fr 36px';

const SOURCE_TYPE_BADGE_CONFIG: Record<
  ApplicationRegistrationSourceType,
  { label: string; color: 'gray' | 'blue' | 'green' }
> = {
  [ApplicationRegistrationSourceType.LOCAL]: {
    label: 'Dev',
    color: 'gray',
  },
  [ApplicationRegistrationSourceType.NPM]: {
    label: 'Npm',
    color: 'blue',
  },
  [ApplicationRegistrationSourceType.TARBALL]: {
    label: 'Internal',
    color: 'green',
  },
  [ApplicationRegistrationSourceType.OAUTH_ONLY]: {
    label: 'OAuth',
    color: 'blue',
  },
};

export const SettingsApplicationsDeveloperTab = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const [displayNotVettedApps, setDisplayNotVettedApps] = useState(false);

  const { copyToClipboard } = useCopyToClipboard();

  const { data, loading } = useQuery(FindManyApplicationRegistrationsDocument);

  const isMarketplaceSettingTabVisible = useIsFeatureEnabled(
    FeatureFlagKey.IS_MARKETPLACE_SETTING_TAB_VISIBLE,
  );

  const [npmSearchTerm, setNpmSearchTerm] = useState('');
  const { data: marketplaceApps } = useMarketplaceApps();

  const filteredMarketplaceApps = useMemo(() => {
    if (!npmSearchTerm) {
      return marketplaceApps;
    }

    const lowerSearch = npmSearchTerm.toLowerCase();

    return marketplaceApps.filter(
      (application) =>
        application.name.toLowerCase().includes(lowerSearch) ||
        application.description.toLowerCase().includes(lowerSearch),
    );
  }, [marketplaceApps, npmSearchTerm]);

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

  const syncCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'yarn twenty dev',
  ];

  const syncCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          syncCommands.join('\n'),
          t`Command copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy command`}
      Icon={IconCopy}
    />
  );

  const RowRightWithBadge = ({
    item,
  }: {
    item: ApplicationRegistrationFragmentFragment;
  }) => {
    const badgeConfig = SOURCE_TYPE_BADGE_CONFIG[item.sourceType];

    return (
      <Tag text={badgeConfig.label} color={badgeConfig.color} preventShrink />
    );
  };

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
            Icon={IconFileInfo}
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

      <Section>
        <H2Title
          title={t`Your apps`}
          description={t`All applications registered on this workspace`}
        />
        {registrations.length > 0 ? (
          <SettingsListCard
            items={registrations}
            getItemLabel={(registration) => registration.name}
            isLoading={loading}
            RowIcon={IconApps}
            to={getRegistrationLink}
            RowRightComponent={RowRightWithBadge}
          />
        ) : (
          !loading && (
            <CommandBlock commands={syncCommands} button={syncCopyButton} />
          )
        )}
      </Section>

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
                  value={npmSearchTerm}
                  onChange={setNpmSearchTerm}
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
                          <Avatar
                            avatarUrl={application.logo || null}
                            placeholder={application.name}
                            placeholderColorSeed={application.name}
                            size="md"
                            type="squared"
                          />
                          <OverflowingTextWithTooltip text={application.name} />
                        </StyledNameTableCell>
                        <TableCell
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          <OverflowingTextWithTooltip
                            text={application.description}
                          />
                        </TableCell>
                        <StyledActionTableCell>
                          <IconChevronRight
                            size={theme.icon.size.md}
                            stroke={theme.icon.stroke.sm}
                            color={theme.font.color.tertiary}
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
