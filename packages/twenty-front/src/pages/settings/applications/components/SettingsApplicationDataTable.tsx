import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { H2Title } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsApplicationFieldsTableRow } from '~/pages/settings/applications/components/SettingsApplicationFieldsTableRow';
import { SettingsApplicationObjectsTableRow } from '~/pages/settings/applications/components/SettingsApplicationObjectsTableRow';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export type ApplicationObjectRow = {
  key: string;
  labelPlural: string;
  icon?: string;
  fieldsCount: number;
  link?: string;
};

export type ApplicationFieldRow = {
  key: string;
  fieldLabel: string;
  fieldIcon?: string;
  objectLabel: string;
  objectIcon?: string;
  link?: string;
};

const OBJECTS_GRID_COLUMNS = '1fr 100px 36px';
const FIELDS_GRID_COLUMNS = '1fr 200px 36px';

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledSubsectionTitle = styled.h3`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: ${themeCssVariables.spacing[6]} 0 ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationDataTable = ({
  objectRows,
  fieldRows,
}: {
  objectRows: ApplicationObjectRow[];
  fieldRows: ApplicationFieldRow[];
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const normalizedSearch = useMemo(
    () => normalizeSearchText(searchTerm),
    [searchTerm],
  );

  const filteredObjectRows = useMemo(() => {
    if (normalizedSearch === '') return objectRows;
    return objectRows.filter((row) =>
      normalizeSearchText(row.labelPlural).includes(normalizedSearch),
    );
  }, [objectRows, normalizedSearch]);

  const filteredFieldRows = useMemo(() => {
    if (normalizedSearch === '') return fieldRows;
    return fieldRows.filter(
      (row) =>
        normalizeSearchText(row.fieldLabel).includes(normalizedSearch) ||
        normalizeSearchText(row.objectLabel).includes(normalizedSearch),
    );
  }, [fieldRows, normalizedSearch]);

  const hasObjects = filteredObjectRows.length > 0;
  const hasFields = filteredFieldRows.length > 0;
  const hasSearchTerm = searchTerm.trim().length > 0;
  const hasNoResults = hasSearchTerm && !hasObjects && !hasFields;

  if (objectRows.length === 0 && fieldRows.length === 0) {
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
          placeholder={t`Search...`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      {hasNoResults && (
        <SettingsEmptyPlaceholder>{t`No match`}</SettingsEmptyPlaceholder>
      )}
      {hasObjects && (
        <>
          <StyledSubsectionTitle>{t`Objects`}</StyledSubsectionTitle>
          <Table>
            <TableRow gridAutoColumns={OBJECTS_GRID_COLUMNS}>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader align="right">{t`Fields`}</TableHeader>
              <TableHeader />
            </TableRow>
            <TableBody>
              {filteredObjectRows.map((row) => (
                <SettingsApplicationObjectsTableRow
                  key={row.key}
                  row={row}
                  gridAutoColumns={OBJECTS_GRID_COLUMNS}
                />
              ))}
            </TableBody>
          </Table>
        </>
      )}
      {hasFields && (
        <>
          <StyledSubsectionTitle>{t`Fields added to other objects`}</StyledSubsectionTitle>
          <Table>
            <TableRow gridAutoColumns={FIELDS_GRID_COLUMNS}>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Object`}</TableHeader>
              <TableHeader />
            </TableRow>
            <TableBody>
              {filteredFieldRows.map((row) => (
                <SettingsApplicationFieldsTableRow
                  key={row.key}
                  row={row}
                  gridAutoColumns={FIELDS_GRID_COLUMNS}
                />
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Section>
  );
};
