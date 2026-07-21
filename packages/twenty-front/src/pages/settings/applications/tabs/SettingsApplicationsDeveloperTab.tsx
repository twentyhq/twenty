import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useState } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { CommandBlock } from 'twenty-ui/data-display';
import { IconArrowUpRight, IconChevronRight, IconCopy } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button, SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  type ApplicationRegistrationListItemFragment,
  FeatureFlagKey,
  FindManyApplicationRegistrationsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import {
  APPLICATION_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SettingsClaimApplicationSection } from '~/pages/settings/applications/components/SettingsClaimApplicationSection';

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

export const SettingsApplicationsDeveloperTab = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const { data } = useQuery(FindManyApplicationRegistrationsDocument);

  const canClaimApplications = useHasPermissionFlag(
    PermissionFlagType.APPLICATIONS,
  );

  const isAppClaimingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_CLAIMING_ENABLED,
  );

  const [myAppsSearchTerm, setMyAppsSearchTerm] = useState('');

  const registrations: ApplicationRegistrationListItemFragment[] =
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
    registration: ApplicationRegistrationListItemFragment,
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

      {canClaimApplications && isAppClaimingEnabled && (
        <SettingsClaimApplicationSection />
      )}

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
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Type`}</TableHeader>
              <TableHeader>{''}</TableHeader>
              <TableHeader />
            </TableRow>
            <StyledTableRowsContainer>
              {registrations.map((registration) => {
                return (
                  <SettingsApplicationTableRow
                    key={registration.id}
                    application={registration}
                    sourceType={registration.sourceType}
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
    </>
  );
};
