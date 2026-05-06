import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsApplicationCommandMenuItemSettingsTabProps = {
  label: string;
  shortLabel?: string | null;
  icon?: string | null;
  isPinned: boolean;
  availabilityType: string;
  conditionalAvailabilityExpression?: string | null;
  frontComponentName?: string | null;
  universalIdentifier?: string | null;
  createdAt: string;
  updatedAt: string;
};

const StyledMonoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleString();
};

const GRID_TEMPLATE = '220px 1fr';

export const SettingsApplicationCommandMenuItemSettingsTab = ({
  label,
  shortLabel,
  icon,
  isPinned,
  availabilityType,
  conditionalAvailabilityExpression,
  frontComponentName,
  universalIdentifier,
  createdAt,
  updatedAt,
}: SettingsApplicationCommandMenuItemSettingsTabProps) => {
  const detailRows: { key: string; label: string; value: ReactNode }[] = [
    {
      key: 'label',
      label: t`Label`,
      value: label,
    },
    {
      key: 'shortLabel',
      label: t`Short label`,
      value: shortLabel ?? t`Not set`,
    },
    {
      key: 'icon',
      label: t`Icon`,
      value: icon ? <StyledMonoText>{icon}</StyledMonoText> : t`Not set`,
    },
    {
      key: 'isPinned',
      label: t`Pinned`,
      value: isPinned ? t`Yes` : t`No`,
    },
    {
      key: 'availabilityType',
      label: t`Availability`,
      value: <StyledMonoText>{availabilityType}</StyledMonoText>,
    },
    {
      key: 'conditionalAvailabilityExpression',
      label: t`Conditional availability`,
      value: conditionalAvailabilityExpression ? (
        <StyledMonoText>{conditionalAvailabilityExpression}</StyledMonoText>
      ) : (
        t`Not set`
      ),
    },
    {
      key: 'frontComponent',
      label: t`Front component`,
      value: frontComponentName ? (
        <StyledMonoText>{frontComponentName}</StyledMonoText>
      ) : (
        t`Not set`
      ),
    },
    {
      key: 'universalIdentifier',
      label: t`Universal identifier`,
      value: (
        <StyledMonoText>{universalIdentifier ?? t`Not set`}</StyledMonoText>
      ),
    },
    {
      key: 'createdAt',
      label: t`Created`,
      value: formatDateTime(createdAt),
    },
    {
      key: 'updatedAt',
      label: t`Updated`,
      value: formatDateTime(updatedAt),
    },
  ];

  return (
    <Section>
      <H2Title
        title={t`Details`}
        description={t`Configuration of this command menu item`}
      />
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE}>
          <TableHeader>{t`Property`}</TableHeader>
          <TableHeader>{t`Value`}</TableHeader>
        </TableRow>
        <TableSection title={t`Command menu item`}>
          {detailRows.map((row) => (
            <TableRow key={row.key} gridTemplateColumns={GRID_TEMPLATE}>
              <TableCell color={themeCssVariables.font.color.secondary}>
                {row.label}
              </TableCell>
              <TableCell minWidth="0" overflow="hidden">
                {row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableSection>
      </Table>
    </Section>
  );
};
