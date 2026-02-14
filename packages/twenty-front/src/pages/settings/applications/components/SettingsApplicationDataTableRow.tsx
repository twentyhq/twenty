import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSubRow } from '@/ui/layout/table/components/TableSubRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight, useIcons } from 'twenty-ui/display';

import { type ApplicationDataTableRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';

const MAIN_ROW_GRID_COLUMNS = '180px 1fr 98.7px 36px';
const FIELD_SUB_ROW_GRID_COLUMNS = '180px 1fr';

const StyledFieldDivider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledFieldNameTableCell = styled(StyledNameTableCell)`
  color: ${({ theme }) => theme.font.color.secondary};
`;

export const SettingsApplicationDataTableRow = ({
  row,
  isExpanded,
  onToggle,
}: {
  row: ApplicationDataTableRow;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const Icon = getIcon(row.icon);
  const hasFields = isDefined(row.fields) && row.fields.length > 0;

  return (
    <>
      <TableRow
        gridAutoColumns={MAIN_ROW_GRID_COLUMNS}
        onClick={hasFields ? onToggle : undefined}
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
    </>
  );
};
