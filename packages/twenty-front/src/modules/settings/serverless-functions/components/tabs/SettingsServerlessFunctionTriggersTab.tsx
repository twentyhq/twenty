import { H2Title, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { type ServerlessFunction } from '~/generated/graphql';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { Table } from '@/ui/layout/table/components/Table';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { Tag } from 'twenty-ui/components';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';

export const StyledRouteTriggerTableRow = styled(TableRow)`
  grid-template-columns: 1fr 120px 120px;
`;

const StyledTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.tertiary};
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  overflow: hidden;
`;

const StyledRouteTriggerTableHeaderRow = styled(StyledRouteTriggerTableRow)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsServerlessFunctionTriggersTab = ({
  serverlessFunction,
}: {
  serverlessFunction: ServerlessFunction;
}) => {
  const { t } = useLingui();

  const databaseEventTriggers = serverlessFunction.databaseEventTriggers ?? [];

  const cronTriggers = serverlessFunction.cronTriggers ?? [];

  const routeTriggers = serverlessFunction.routeTriggers ?? [];

  const databaseEvents = databaseEventTriggers?.map((event) => {
    const [object, action]: [string, string] =
      event.settings.eventName.split('.');

    return { object, action };
  });

  return (
    <>
      {databaseEvents.length > 0 && (
        <Section>
          <H2Title
            title={t`Database event`}
            description={t`Select the events that should trigger the function`}
          />
          <SettingsDatabaseEventsForm events={databaseEvents} disabled />
        </Section>
      )}

      {cronTriggers.length > 0 && (
        <Section>
          <H2Title
            title={t`Cron`}
            description={t`Triggers the function at regular intervals`}
          />
          {cronTriggers.map((cronTrigger, index) => (
            <FormTextFieldInput
              key={index}
              label={t`Expression`}
              placeholder="0 */1 * * *"
              hint={t`Format: [Minute] [Hour] [Day of Month] [Month] [Day of Week]`}
              onChange={() => {}}
              readonly
              defaultValue={cronTrigger.settings.pattern}
            />
          ))}
        </Section>
      )}

      {routeTriggers.length > 0 && (
        <Section>
          <H2Title
            title={t`Http`}
            description={t`Triggers the function with Http request`}
          />
          <Table>
            <StyledRouteTriggerTableHeaderRow>
              <TableHeader>{t`Path`}</TableHeader>
              <TableHeader>{t`Method`}</TableHeader>
              <TableHeader>{t`Auth Required`}</TableHeader>
            </StyledRouteTriggerTableHeaderRow>
            {routeTriggers.map((routeTrigger, index) => (
              <StyledRouteTriggerTableRow key={index}>
                <StyledTableCell>
                  <OverflowingTextWithTooltip text={routeTrigger.path} />
                </StyledTableCell>
                <StyledTableCell>{routeTrigger.httpMethod}</StyledTableCell>
                <StyledTableCell>
                  <Tag
                    text={routeTrigger.isAuthRequired ? t`True` : t`False`}
                    color={routeTrigger.isAuthRequired ? 'green' : 'orange'}
                    weight="medium"
                  />
                </StyledTableCell>
              </StyledRouteTriggerTableRow>
            ))}
          </Table>
        </Section>
      )}
    </>
  );
};
