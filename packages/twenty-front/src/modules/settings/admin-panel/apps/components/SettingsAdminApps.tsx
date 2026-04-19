import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { assertUnreachable, getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import {
  H2Title,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
  FindAllApplicationRegistrationsDocument,
} from '~/generated-admin/graphql';

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const TABLE_GRID = '1fr 100px 100px 40px';
const TABLE_GRID_MOBILE = '3fr 3fr 1fr 40px';

export const SettingsAdminApps = () => {
  const apolloAdminClient = useApolloAdminClient();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useContext(ThemeContext);

  const { data } = useQuery(FindAllApplicationRegistrationsDocument, {
    client: apolloAdminClient,
  });

  const registrations: ApplicationRegistrationFragmentFragment[] =
    data?.findAllApplicationRegistrations ?? [];

  const filtered =
    searchQuery.trim().length === 0
      ? registrations
      : registrations.filter((registration) => {
          const query = searchQuery.toLowerCase();

          return (
            registration.name.toLowerCase().includes(query) ||
            (registration.sourcePackage ?? '').toLowerCase().includes(query) ||
            registration.universalIdentifier.toLowerCase().includes(query)
          );
        });

  const getFormattedSource = (
    registration: ApplicationRegistrationFragmentFragment,
  ) => {
    switch (registration.sourceType) {
      case ApplicationRegistrationSourceType.TARBALL: {
        return 'Tarball';
      }
      case ApplicationRegistrationSourceType.NPM: {
        return 'NPM';
      }
      case ApplicationRegistrationSourceType.OAUTH_ONLY: {
        return 'OAuth';
      }
      case ApplicationRegistrationSourceType.LOCAL: {
        return 'Local';
      }
      default:
        return assertUnreachable(registration.sourceType);
    }
  };

  return (
    <Section>
      <H2Title
        title={t`All App Registrations`}
        description={t`All application registrations across the platform, including orphaned marketplace apps`}
      />
      <SearchInput
        placeholder={t`Search registrations...`}
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <StyledTableContainer>
        <Table>
          <TableRow
            gridAutoColumns={TABLE_GRID}
            mobileGridAutoColumns={TABLE_GRID_MOBILE}
          >
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader align="right">{t`Source`}</TableHeader>
            <TableHeader align="right">{t`Listed`}</TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
          <TableBody>
            {filtered.map((registration) => (
              <TableRow
                key={registration.id}
                to={getSettingsPath(
                  SettingsPath.AdminPanelApplicationRegistrationDetail,
                  { applicationRegistrationId: registration.id },
                )}
                gridAutoColumns={TABLE_GRID}
                mobileGridAutoColumns={TABLE_GRID_MOBILE}
                isClickable
              >
                <TableCell color={themeCssVariables.font.color.primary}>
                  <OverflowingTextWithTooltip text={registration.name} />
                </TableCell>
                <TableCell overflow="hidden" align="right">
                  {getFormattedSource(registration)}
                </TableCell>
                <TableCell align="right">
                  {registration.isListed ? t`Yes` : t`No`}
                </TableCell>
                <TableCell align="right">
                  <IconChevronRight
                    size={theme.icon.size.md}
                    color={theme.font.color.tertiary}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Section>
  );
};
