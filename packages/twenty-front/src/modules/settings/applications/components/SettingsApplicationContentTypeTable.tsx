import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsApplicationContentTypeIcon } from '@/settings/applications/components/SettingsApplicationContentTypeIcon';
import { SettingsApplicationTableRowChevronIcon } from '@/settings/applications/components/SettingsApplicationTableRowChevronIcon';
import { APPLICATION_CONTENT_TYPE_CONFIGS } from '@/settings/applications/constants/ApplicationContentTypeConfigs';
import { type ApplicationContentLocation } from '@/settings/applications/types/ApplicationContentLocation';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentPath } from '@/settings/applications/utils/getApplicationContentPath';
import { StyledNameTableCell } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const CONTENT_TYPE_TABLE_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 200px) minmax(0, 1fr) 64px 36px';

export type SettingsApplicationContentTypeTableRow = {
  contentType: ApplicationContentType;
  secondaryText: string;
  count: number;
};

type SettingsApplicationContentTypeTableProps = {
  rows: SettingsApplicationContentTypeTableRow[];
  secondaryColumnLabel: string;
  location: ApplicationContentLocation;
};

export const SettingsApplicationContentTypeTable = ({
  rows,
  secondaryColumnLabel,
  location,
}: SettingsApplicationContentTypeTableProps) => {
  const { t } = useLingui();

  return (
    <Table>
      <TableRow gridTemplateColumns={CONTENT_TYPE_TABLE_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{secondaryColumnLabel}</TableHeader>
        <TableHeader align="right">{t`Count`}</TableHeader>
        <TableHeader />
      </TableRow>
      {rows.map(({ contentType, secondaryText, count }) => (
        <TableRow
          key={contentType}
          gridTemplateColumns={CONTENT_TYPE_TABLE_GRID_TEMPLATE_COLUMNS}
          to={getApplicationContentPath({ location, contentType })}
        >
          <StyledNameTableCell minWidth="0" overflow="hidden">
            <SettingsApplicationContentTypeIcon contentType={contentType} />
            <OverflowingTextWithTooltip
              text={t(APPLICATION_CONTENT_TYPE_CONFIGS[contentType].label)}
            />
          </StyledNameTableCell>
          <TableCell
            color={themeCssVariables.font.color.secondary}
            minWidth="0"
            overflow="hidden"
          >
            <OverflowingTextWithTooltip text={secondaryText} />
          </TableCell>
          <TableCell
            align="right"
            color={themeCssVariables.font.color.secondary}
          >
            {count}
          </TableCell>
          <TableCell
            align="right"
            padding={`0 ${themeCssVariables.spacing[2]} 0 0`}
          >
            <SettingsApplicationTableRowChevronIcon />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};
