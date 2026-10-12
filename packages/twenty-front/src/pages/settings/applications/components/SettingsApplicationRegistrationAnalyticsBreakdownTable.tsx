import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type ApplicationRegistrationAnalyticsBreakdownItem } from '~/generated-metadata/graphql';

const GRID_TEMPLATE_COLUMNS = '1fr 160px';

type SettingsApplicationRegistrationAnalyticsBreakdownTableProps = {
  title: string;
  description: string;
  keyHeader: string;
  valueHeader: string;
  items: Omit<ApplicationRegistrationAnalyticsBreakdownItem, '__typename'>[];
  formatValue: (value: number) => string;
};

export const SettingsApplicationRegistrationAnalyticsBreakdownTable = ({
  title,
  description,
  keyHeader,
  valueHeader,
  items,
  formatValue,
}: SettingsApplicationRegistrationAnalyticsBreakdownTableProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header title={title} description={description} />
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{keyHeader}</TableHeader>
          <TableHeader align="right">{valueHeader}</TableHeader>
        </TableRow>
        {items.map((item) => (
          <TableRow key={item.key} gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
            <TableCell color={themeCssVariables.font.color.primary}>
              {item.key}
            </TableCell>
            <TableCell align="right">{formatValue(item.value)}</TableCell>
          </TableRow>
        ))}
      </Table>
    </Section.Root>
  );
};
