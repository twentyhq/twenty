import { H2Title, IconChevronRight, IconSearch } from 'twenty-ui/display';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import {
  SettingsApplicationTableRow,
  StyledApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { useTheme } from '@emotion/react';
import { type ApplicationWithoutRelation } from '~/pages/settings/applications/types/applicationWithoutRelation';
import { Section } from 'twenty-ui/layout';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useMemo, useState } from 'react';

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(StyledApplicationTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const SettingsApplicationsTable = ({
  applications,
}: {
  applications: ApplicationWithoutRelation[];
}) => {
  const { t } = useLingui();

  const theme = useTheme();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (application) =>
        application.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [applications, searchTerm]);

  return (
    <Section>
      <H2Title
        title={t`Installed applications`}
        description={t`List installed applications. Use filter to search for a specific application`}
      />
      <StyledSearchInput
        instanceId="env-var-search"
        LeftIcon={IconSearch}
        placeholder={t`Search an application`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <StyledTable>
        <StyledTableHeaderRow>
          <TableHeader> {t`Name`}</TableHeader>
          <TableHeader> {t`Description`}</TableHeader>
          <TableHeader> {''}</TableHeader>
          <TableHeader />
        </StyledTableHeaderRow>
        {filteredApplications.map((application) => (
          <SettingsApplicationTableRow
            key={application.id}
            application={application}
            action={
              <IconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            }
            link={getSettingsPath(SettingsPath.ApplicationDetail, {
              applicationId: application.id,
            })}
          />
        ))}
      </StyledTable>
    </Section>
  );
};
