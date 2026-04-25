import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import {
  H2Title,
  IconChevronRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

export type ApplicationNameDescriptionTableRow = {
  key: string;
  name: string;
  description?: string | null;
  link?: string;
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
  const { theme } = useContext(ThemeContext);

  if (items.length === 0) {
    return null;
  }

  const hasAnyLink = items.some((item) => item.link !== undefined);
  const gridTemplate = hasAnyLink ? '180px 1fr 32px' : '180px 1fr';

  return (
    <Section>
      <H2Title title={title} description={description} />
      <Table>
        <TableRow gridTemplateColumns={gridTemplate}>
          <TableHeader>{t`Name`}</TableHeader>
          <TableHeader>{t`Description`}</TableHeader>
          {hasAnyLink && <TableHeader></TableHeader>}
        </TableRow>
        <TableSection title={sectionTitle}>
          {items.map((item) => (
            <TableRow
              key={item.key}
              gridTemplateColumns={gridTemplate}
              to={item.link}
            >
              <TableCell
                color={themeCssVariables.font.color.primary}
                gap={themeCssVariables.spacing[2]}
                minWidth="0"
                overflow="hidden"
              >
                <OverflowingTextWithTooltip text={item.name} />
              </TableCell>
              <TableCell minWidth="0" overflow="hidden">
                <OverflowingTextWithTooltip text={item.description ?? ''} />
              </TableCell>
              {hasAnyLink && (
                <TableCell
                  align="center"
                  color={themeCssVariables.font.color.light}
                  padding={`0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]}`}
                >
                  {item.link !== undefined && (
                    <IconChevronRight
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </Section>
  );
};
