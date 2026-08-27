import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { Button } from 'twenty-ui/input';
import { IconRestore, IconTimelineEvent } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

type SettingsApplicationTimelineActivityTypeSettingsTabProps = {
  timelineActivityType: SettingsApplicationTimelineActivityType;
  canReset: boolean;
  disabled: boolean;
  onIsActiveChange: (isActive: boolean) => void;
  onReset: () => void;
};

const StyledMonoText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family}, monospace;
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GRID_TEMPLATE = '220px 1fr';

export const SettingsApplicationTimelineActivityTypeSettingsTab = ({
  timelineActivityType,
  canReset,
  disabled,
  onIsActiveChange,
  onReset,
}: SettingsApplicationTimelineActivityTypeSettingsTabProps) => {
  const detailRows: { key: string; label: string; value: ReactNode }[] = [
    {
      key: 'label',
      label: t`Label`,
      value: timelineActivityType.label,
    },
    {
      key: 'name',
      label: t`Name`,
      value: <StyledMonoText>{timelineActivityType.name}</StyledMonoText>,
    },
    {
      key: 'event',
      label: t`Event`,
      value: timelineActivityType.action ?? t`Not set`,
    },
    {
      key: 'objectUniversalIdentifier',
      label: t`Object`,
      value: (
        <StyledMonoText>
          {timelineActivityType.objectUniversalIdentifier ?? t`Not set`}
        </StyledMonoText>
      ),
    },
    {
      key: 'frontComponentUniversalIdentifier',
      label: t`Front component`,
      value: (
        <StyledMonoText>
          {timelineActivityType.frontComponentUniversalIdentifier ?? t`Not set`}
        </StyledMonoText>
      ),
    },
    {
      key: 'universalIdentifier',
      label: t`Universal identifier`,
      value: (
        <StyledMonoText>
          {timelineActivityType.universalIdentifier}
        </StyledMonoText>
      ),
    },
  ];

  return (
    <>
      <Section>
        <H2Title
          title={t`Details`}
          description={t`Configuration of this timeline activity type`}
        />
        <Table>
          <TableRow gridTemplateColumns={GRID_TEMPLATE}>
            <TableHeader>{t`Property`}</TableHeader>
            <TableHeader>{t`Value`}</TableHeader>
          </TableRow>
          <TableSection title={t`Timeline activity type`}>
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
      <Section>
        <H2Title
          title={t`Activity visibility`}
          description={t`Choose whether this activity type appears in record timelines`}
        />
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
            Icon={IconTimelineEvent}
            title={t`Active`}
            description={t`Show this activity type in record timelines`}
            checked={timelineActivityType.isActive}
            disabled={disabled}
            onChange={onIsActiveChange}
          />
        </Card>
      </Section>
      {canReset && (
        <Section>
          <H2Title
            title={t`Reset`}
            description={t`Restore the activity type settings defined by the application`}
          />
          <Button
            title={t`Reset to default`}
            variant="secondary"
            size="small"
            Icon={IconRestore}
            disabled={disabled}
            onClick={onReset}
          />
        </Section>
      )}
    </>
  );
};
