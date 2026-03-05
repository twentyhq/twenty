import { SettingsItemTypeTag } from '@/settings/components/SettingsItemTypeTag';
import { SettingsObjectFieldDataType } from '@/settings/data-model/object-details/components/SettingsObjectFieldDataType';
import { type SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSubRow } from '@/ui/layout/table/components/TableSubRow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight, useIcons } from 'twenty-ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

import { type ApplicationDataTableRow } from '~/pages/settings/applications/components/SettingsApplicationDataTable';

const MAIN_ROW_GRID_COLUMNS = '180px 1fr 98.7px 36px';
const FIELD_SUB_ROW_GRID_COLUMNS = '180px 1fr';

const StyledFieldDivider = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
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
        <TableCell
          color={themeCssVariables.font.color.primary}
          gap={themeCssVariables.spacing[2]}
        >
          {isDefined(Icon) && (
            <Icon
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
            />
          )}
          {row.labelPlural}
        </TableCell>
        <TableCell>
          <SettingsItemTypeTag item={row.tagItem} />
        </TableCell>
        <TableCell align="right">{row.fieldsCount}</TableCell>
        <TableCell
          align="center"
          padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
        >
          {hasFields && isExpanded ? (
            <IconChevronDown
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
              color={resolveThemeVariable(
                themeCssVariables.font.color.tertiary,
              )}
            />
          ) : (
            <IconChevronRight
              size={resolveThemeVariableAsNumber(
                themeCssVariables.icon.size.md,
              )}
              stroke={resolveThemeVariableAsNumber(
                themeCssVariables.icon.stroke.sm,
              )}
              color={resolveThemeVariable(
                themeCssVariables.font.color.tertiary,
              )}
            />
          )}
        </TableCell>
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
              <TableCell
                color={themeCssVariables.font.color.secondary}
                gap={themeCssVariables.spacing[2]}
              >
                {isDefined(FieldIcon) && (
                  <FieldIcon
                    size={resolveThemeVariableAsNumber(
                      themeCssVariables.icon.size.md,
                    )}
                    stroke={resolveThemeVariableAsNumber(
                      themeCssVariables.icon.stroke.sm,
                    )}
                  />
                )}
                {field.label}
              </TableCell>
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
