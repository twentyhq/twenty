import { IconChevronRight } from 'twenty-ui/display';
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

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(StyledApplicationTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApplicationsTable = ({
  applications,
}: {
  applications: ApplicationWithoutRelation[];
}) => {
  const { t } = useLingui();

  const theme = useTheme();

  return (
    <StyledTable>
      <StyledTableHeaderRow>
        <TableHeader> {t`Name`}</TableHeader>
        <TableHeader> {t`Description`}</TableHeader>
        <TableHeader />
      </StyledTableHeaderRow>
      {applications.map((application) => (
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
  );
};
