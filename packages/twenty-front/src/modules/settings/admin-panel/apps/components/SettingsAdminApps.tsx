import { FIND_ALL_APPLICATION_REGISTRATIONS } from '@/settings/admin-panel/apps/graphql/queries/findAllApplicationRegistrations';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, Status } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type ApplicationRegistrationFragmentFragment } from '~/generated-metadata/graphql';

const StyledTableContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledTableHeaderRowContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const TABLE_GRID = '1fr 1fr 100px 100px 80px';

const StyledClickableRow = styled(TableRow)`
  cursor: pointer;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

export const SettingsAdminApps = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigateSettings = useNavigateSettings();

  const { data } = useQuery(FIND_ALL_APPLICATION_REGISTRATIONS);

  const registrations: ApplicationRegistrationFragmentFragment[] =
    data?.findAllApplicationRegistrations ?? [];

  const filtered = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return registrations;
    }
    const query = searchQuery.toLowerCase();

    return registrations.filter(
      (registration) =>
        registration.name.toLowerCase().includes(query) ||
        (registration.sourcePackage ?? '').toLowerCase().includes(query) ||
        registration.universalIdentifier.toLowerCase().includes(query),
    );
  }, [registrations, searchQuery]);

  const handleRowClick = (registration: ApplicationRegistrationFragmentFragment) => {
    navigateSettings(
      SettingsPath.ApplicationRegistrationDetail,
      { applicationRegistrationId: registration.id },
    );
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
          <StyledTableHeaderRowContainer>
            <TableRow gridTemplateColumns={TABLE_GRID}>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Source`}</TableHeader>
              <TableHeader>{t`Owner`}</TableHeader>
              <TableHeader>{t`Listed`}</TableHeader>
              <TableHeader>{t`Featured`}</TableHeader>
            </TableRow>
          </StyledTableHeaderRowContainer>
          <TableBody>
            {filtered.map((registration) => (
              <StyledClickableRow
                key={registration.id}
                gridTemplateColumns={TABLE_GRID}
                onClick={() => handleRowClick(registration)}
              >
                <TableCell>{registration.name}</TableCell>
                <TableCell>
                  {registration.sourcePackage ?? registration.sourceType}
                </TableCell>
                <TableCell>
                  {isDefined(registration.ownerWorkspaceId)
                    ? t`Owned`
                    : t`Orphaned`}
                </TableCell>
                <TableCell>
                  <Status
                    color={registration.isListed ? 'green' : 'gray'}
                    text={registration.isListed ? t`Yes` : t`No`}
                  />
                </TableCell>
                <TableCell>
                  <Status
                    color={registration.isFeatured ? 'yellow' : 'gray'}
                    text={registration.isFeatured ? t`Yes` : t`No`}
                  />
                </TableCell>
              </StyledClickableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
    </Section>
  );
};
