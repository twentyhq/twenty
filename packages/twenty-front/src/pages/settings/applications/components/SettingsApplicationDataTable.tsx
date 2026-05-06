import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SETTINGS_OBJECT_TABLE_COLUMN_WIDTH } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsApplicationDataTableRow } from '~/pages/settings/applications/components/SettingsApplicationDataTableRow';
import { normalizeSearchText } from '~/utils/normalizeSearchText';
import { type ApplicationDataTableRow } from '~/pages/settings/applications/types/applicationDataTableRow';

const MAIN_ROW_GRID_COLUMNS = `180px 1fr ${SETTINGS_OBJECT_TABLE_COLUMN_WIDTH} 36px`;

const StyledEmptyHeaderContainer = styled.div`
  > div {
    min-width: 0;
  }
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationDataTable = ({
  objectRows,
  fieldGroupRows,
}: {
  objectRows: ApplicationDataTableRow[];
  fieldGroupRows: ApplicationDataTableRow[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredObjectRows = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);

    if (normalizedSearch === '') {
      return objectRows;
    }

    return objectRows.filter((row) =>
      normalizeSearchText(row.labelPlural).includes(normalizedSearch),
    );
  }, [objectRows, searchTerm]);

  const filteredFieldGroupRows = useMemo(() => {
    const normalizedSearch = normalizeSearchText(searchTerm);

    if (normalizedSearch === '') {
      return fieldGroupRows;
    }

    return fieldGroupRows.filter((row) =>
      normalizeSearchText(row.labelPlural).includes(normalizedSearch),
    );
  }, [fieldGroupRows, searchTerm]);

  const shouldDisplayObjects = filteredObjectRows.length > 0;
  const shouldDisplayFields = filteredFieldGroupRows.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasNoResults =
    hasSearchTerm && !shouldDisplayObjects && !shouldDisplayFields;

  if (objectRows.length === 0 && fieldGroupRows.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title
        title={t`Data`}
        description={t`Objects and fields managed by this app`}
      />
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search an object...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      {hasNoResults ? (
        <SettingsEmptyPlaceholder>{t`No object found`}</SettingsEmptyPlaceholder>
      ) : (
        <Table>
          <TableRow gridAutoColumns={MAIN_ROW_GRID_COLUMNS}>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`App`}</TableHeader>
            <TableHeader align="right">{t`Fields`}</TableHeader>
            <StyledEmptyHeaderContainer>
              <TableHeader />
            </StyledEmptyHeaderContainer>
          </TableRow>
          {shouldDisplayObjects && (
            <TableSection title={t`Objects`}>
              {filteredObjectRows.map((row) => (
                <SettingsApplicationDataTableRow key={row.key} row={row} />
              ))}
            </TableSection>
          )}
          {shouldDisplayFields && (
            <TableSection title={t`Fields`}>
              {filteredFieldGroupRows.map((row) => (
                <SettingsApplicationDataTableRow key={row.key} row={row} />
              ))}
            </TableSection>
          )}
        </Table>
      )}
    </Section>
  );
};
