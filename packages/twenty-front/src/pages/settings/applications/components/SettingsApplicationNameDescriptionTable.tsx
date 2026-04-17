import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { Table } from '@/ui/layout/table/components/Table';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export type ApplicationNameDescriptionTableRow = {
  key: string;
  name: string;
  description?: string | null;
};

export const SettingsApplicationNameDescriptionTable = ({
  title,
  description,
  sectionTitle,
  items,
}: {
  title: string;
  description: string;
  sectionTitle: string;
  items: ApplicationNameDescriptionTableRow[];
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Section>
      <H2Title title={title} description={description} />
      <Table>
        <TableRow gridAutoColumns="180px 1fr">
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Description`}</TableHeader>
        </TableRow>
        <TableSection title={sectionTitle}>
          {items.map((item) => (
            <TableRow key={item.key} gridAutoColumns="180px 1fr">
              <TableCell
                color={themeCssVariables.font.color.primary}
                gap={themeCssVariables.spacing[2]}
              >
                {item.name}
              </TableCell>
              <TableCell>{item.description ?? ''}</TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </Section>
  );
};
