import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { SettingsDatabaseEventsForm } from '@/settings/components/SettingsDatabaseEventsForm';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { H2Title, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { isDefined } from 'twenty-shared/utils';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { Tag } from 'twenty-ui/components';
import { type LogicFunction } from '~/generated-metadata/graphql';

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

const StyledEmptyState = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  height: 160px;
  justify-content: center;
  text-align: center;
`;

export const SettingsLogicFunctionTriggersTab = ({
  logicFunction,
}: {
  logicFunction: LogicFunction;
}) => {
  const { t } = useLingui();

  const cronTrigger = logicFunction.cronTriggerSettings;

  const routeTrigger = logicFunction.httpRouteTriggerSettings;

  const databaseEventTriggerSettings =
    logicFunction.databaseEventTriggerSettings;

  let databaseEventTrigger = undefined;

  if (isDefined(databaseEventTriggerSettings)) {
    const [object, action]: [string, string] =
      databaseEventTriggerSettings.eventName.split('.');
    databaseEventTrigger = {
      object,
      action,
      updatedFields: databaseEventTriggerSettings.updatedFields,
    };
  }
  const hasNoTriggers = !cronTrigger && !routeTrigger && !databaseEventTrigger;

  if (hasNoTriggers) {
    return (
      <Section>
        <H2Title
          title={t`Triggers`}
          description={t`Configure when this function should be executed`}
        />
        <StyledEmptyState>
          {t`No triggers configured for this function.`}
        </StyledEmptyState>
      </Section>
    );
  }

  return (
    <>
      {isDefined(databaseEventTrigger) && (
        <Section>
          <H2Title
            title={t`Database event`}
            description={t`Select the events that should trigger the function`}
          />
          <SettingsDatabaseEventsForm
            events={[databaseEventTrigger]}
            disabled
          />
        </Section>
      )}

      {isDefined(cronTrigger) && (
        <Section>
          <H2Title
            title={t`Cron`}
            description={t`Triggers the function at regular intervals`}
          />
          <FormTextFieldInput
            label={t`Expression`}
            placeholder="0 */1 * * *"
            hint={t`Format: [Minute] [Hour] [Day of Month] [Month] [Day of Week]`}
            onChange={() => {}}
            readonly
            defaultValue={cronTrigger.pattern}
          />
        </Section>
      )}

      {isDefined(routeTrigger) && (
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
            <StyledRouteTriggerTableRow>
              <StyledTableCell>
                <OverflowingTextWithTooltip
                  text={`${REACT_APP_SERVER_BASE_URL}/s${routeTrigger.path}`}
                />
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
          </Table>
        </Section>
      )}
    </>
  );
};
