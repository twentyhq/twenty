import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { Tag } from 'twenty-ui/components';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SchemaProperty = {
  type?: string;
  description?: string;
  format?: string;
  items?: { type?: string };
};

export type SettingsToolParameterTableProps = {
  schemaProperties: Record<string, SchemaProperty>;
  requiredFields?: string[];
};

const PARAMETER_TABLE_GRID = '160px 80px 90px 1fr';

const StyledTableHeaderRow = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledDescriptionCell = styled(TableCell)`
  align-items: flex-start;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const getDisplayType = (property: SchemaProperty): string => {
  if (property.format) {
    return property.format;
  }

  if (property.type === 'array' && property.items?.type) {
    return `${property.items.type}[]`;
  }

  return property.type ?? '';
};

export const SettingsToolParameterTable = ({
  schemaProperties,
  requiredFields,
}: SettingsToolParameterTableProps) => {
  if (Object.keys(schemaProperties).length === 0) {
    return <div>{t`No parameters`}</div>;
  }

  return (
    <Table>
      <StyledTableHeaderRow>
        <TableRow gridTemplateColumns={PARAMETER_TABLE_GRID}>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Type`}</TableHeader>
          <TableHeader>{t`Required`}</TableHeader>
          <TableHeader>{t`Description`}</TableHeader>
        </TableRow>
      </StyledTableHeaderRow>
      {Object.entries(schemaProperties).map(([paramName, property]) => (
        <TableRow
          key={paramName}
          gridTemplateColumns={PARAMETER_TABLE_GRID}
          hoverBackgroundColor={themeCssVariables.background.transparent.light}
        >
          <TableCell
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            <Tag text={paramName} color="gray" weight="medium" />
          </TableCell>
          <TableCell
            color={themeCssVariables.font.color.secondary}
            whiteSpace="nowrap"
          >
            {getDisplayType(property)}
          </TableCell>
          <TableCell>
            {requiredFields?.includes(paramName) && (
              <Tag text={t`required`} color="red" preventShrink />
            )}
          </TableCell>
          <StyledDescriptionCell
            color={themeCssVariables.font.color.tertiary}
            height="auto"
            minWidth="0"
            overflow="hidden"
          >
            <OverflowingTextWithTooltip
              text={property.description ?? ''}
              displayedMaxRows={2}
              isTooltipMultiline
            />
          </StyledDescriptionCell>
        </TableRow>
      ))}
    </Table>
  );
};
