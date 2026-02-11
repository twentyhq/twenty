import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { TableSubRow } from '@/ui/layout/table/components/TableSubRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconChevronDown,
  IconChevronRight,
  useIcons,
} from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export type ApplicationDataTableFieldItem = {
  key: string;
  label: string;
  icon?: string;
  type: string;
};

export type ApplicationDataTableRow = {
  key: string;
  labelPlural: string;
  icon?: string;
  fieldsCount: number;
  link?: string;
  fields?: ApplicationDataTableFieldItem[];
  tagItem: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
};

const MAIN_ROW_GRID_COLUMNS = '180px 1fr 98.7px 36px';
const FIELD_SUB_ROW_GRID_COLUMNS = '180px 1fr';

const StyledFieldDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledFieldNameTableCell = styled(StyledNameTableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledEmptyHeader = styled(TableHeader)`
  min-width: 0;
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

export const SettingsApplicationDataTable = ({
  objectRows,
  fieldGroupRows,
}: {
  objectRows: ApplicationDataTableRow[];
  fieldGroupRows: ApplicationDataTableRow[];
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows((previous) => {
      const next = new Set(previous);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  };

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

  const renderRow = (row: ApplicationDataTableRow) => {
    const Icon = getIcon(row.icon);
    const isExpanded = expandedRows.has(row.key);
    const hasFields = isDefined(row.fields) && row.fields.length > 0;

    return (
      <div key={row.key}>
        <TableRow
          gridAutoColumns={MAIN_ROW_GRID_COLUMNS}
          onClick={hasFields ? () => toggleRow(row.key) : undefined}
          to={hasFields ? undefined : row.link}
        >
          <StyledNameTableCell>
            {isDefined(Icon) && (
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
            )}
            {row.labelPlural}
          </StyledNameTableCell>
          <TableCell>
            <SettingsItemTypeTag item={row.tagItem} />
          </TableCell>
          <TableCell align="right">{row.fieldsCount}</TableCell>
          <StyledActionTableCell>
            {hasFields && isExpanded ? (
              <IconChevronDown
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
                color={theme.font.color.tertiary}
              />
            ) : (
              <IconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
                color={theme.font.color.tertiary}
              />
            )}
          </StyledActionTableCell>
        </TableRow>
        {hasFields && isExpanded && (
          <>
            <StyledFieldDivider />
            <TableSubRow gridAutoColumns={FIELD_SUB_ROW_GRID_COLUMNS}>
              <TableHeader>{t`Name`}</TableHeader>
              <TableHeader>{t`Type`}</TableHeader>
            </TableSubRow>
          </>
        )}
        {hasFields &&
          isExpanded &&
          row.fields?.map((field) => {
            const FieldIcon = getIcon(field.icon);

            return (
              <TableSubRow
                key={field.key}
                gridAutoColumns={FIELD_SUB_ROW_GRID_COLUMNS}
              >
                <StyledFieldNameTableCell>
                  {isDefined(FieldIcon) && (
                    <FieldIcon
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  )}
                  {field.label}
                </StyledFieldNameTableCell>
                <TableCell>
                  <SettingsObjectFieldDataType
                    value={field.type as SettingsFieldType}
                  />
                </TableCell>
              </TableSubRow>
            );
          })}
      </div>
    );
  };

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
        <StyledEmptyState>{t`No object found`}</StyledEmptyState>
      ) : (
        <Table>
          <TableRow gridAutoColumns={MAIN_ROW_GRID_COLUMNS}>
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`App`}</TableHeader>
            <TableHeader align="right">{t`Fields`}</TableHeader>
            <StyledEmptyHeader />
          </TableRow>
          {shouldDisplayObjects && (
            <TableSection title={t`Objects`}>
              {filteredObjectRows.map(renderRow)}
            </TableSection>
          )}
          {shouldDisplayFields && (
            <TableSection title={t`Fields`}>
              {filteredFieldGroupRows.map(renderRow)}
            </TableSection>
          )}
        </Table>
      )}
    </Section>
  );
};
