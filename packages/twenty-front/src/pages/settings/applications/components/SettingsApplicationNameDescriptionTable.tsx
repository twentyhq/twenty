import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { Table } from '@/ui/layout/table/components/Table';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

type SettingsApplicationNameDescriptionTableItem = {
  name: string;
  description?: string | null;
};

const StyledNameTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsApplicationNameDescriptionTable = ({
  title,
  description,
  sectionTitle,
  items,
}: {
  title: string;
  description: string;
  sectionTitle: string;
  items: SettingsApplicationNameDescriptionTableItem[];
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
            <TableRow key={item.name} gridAutoColumns="180px 1fr">
              <StyledNameTableCell>{item.name}</StyledNameTableCell>
              <TableCell>{item.description ?? ''}</TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </Section>
  );
};
