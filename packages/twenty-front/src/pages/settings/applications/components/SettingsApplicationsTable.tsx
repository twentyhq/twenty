import { IconChevronRight, IconSearch } from 'twenty-ui/display';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { SETTINGS_APPLICATION_TABLE_METADATA } from '~/pages/settings/applications/constants/SettingsApplicationTableMetadata';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import {
  SettingsApplicationTableRow,
  StyledApplicationTableRow,
} from '~/pages/settings/applications/components/SettingsApplicationTableRow';
import { useTheme } from '@emotion/react';
import { type Application } from '~/generated/graphql';

const StyledSearchInput = styled(SettingsTextInput)`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledTableHeaderRow = styled(StyledApplicationTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApplicationsTable = ({
  applications,
}: {
  applications: Application[];
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedApplications = useSortedArray(
    applications,
    SETTINGS_APPLICATION_TABLE_METADATA,
  );

  const filteredApplications = sortedApplications.filter((application) => {
    const searchNormalized = normalizeSearchText(searchTerm);
    return (
      normalizeSearchText(application.name).includes(searchNormalized) ||
      normalizeSearchText(application.description).includes(searchNormalized)
    );
  });

  return (
    <>
      <StyledSearchInput
        instanceId="settings-applications-search"
        LeftIcon={IconSearch}
        placeholder={t`Search an application...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />

      <StyledTable>
        <StyledTableHeaderRow>
          {SETTINGS_APPLICATION_TABLE_METADATA.fields.map(
            (settingsApplicationTableMetadataField) => (
              <SortableTableHeader
                key={settingsApplicationTableMetadataField.fieldName}
                fieldName={settingsApplicationTableMetadataField.fieldName}
                label={t(settingsApplicationTableMetadataField.fieldLabel)}
                tableId={SETTINGS_APPLICATION_TABLE_METADATA.tableId}
                align={settingsApplicationTableMetadataField.align}
                initialSort={SETTINGS_APPLICATION_TABLE_METADATA.initialSort}
              />
            ),
          )}
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
    </>
  );
};
