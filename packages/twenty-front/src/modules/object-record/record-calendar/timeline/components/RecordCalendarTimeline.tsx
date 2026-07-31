import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarTimelineRecord } from '@/object-record/record-calendar/timeline/components/RecordCalendarTimelineRecord';
import { RECORD_CALENDAR_TIMELINE_INPUT_ID_PREFIX } from '@/object-record/record-calendar/timeline/constants/RecordCalendarTimelineInputIdPrefix';
import { recordCalendarTimelineGroupsComponentSelector } from '@/object-record/record-calendar/timeline/states/recordCalendarTimelineGroupsComponentSelector';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

const StyledTimeline = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledMonth = styled.section`
  & + & {
    margin-top: ${themeCssVariables.spacing[4]};
  }
`;

const StyledMonthHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  height: 17px;
  padding-left: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledMonthName = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledYear = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

const StyledMonthDays = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-top: ${themeCssVariables.spacing[4]};
  overflow: hidden;
`;

const StyledDay = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-height: 40px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: 0;
  }
`;

const StyledDayLabel = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  justify-content: center;
`;

const StyledWeekday = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: 9px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: normal;
`;

const StyledDayNumber = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  line-height: 1.4;
`;

const StyledDivider = styled.div`
  align-self: stretch;
  background: ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  flex: 0 0 1px;
`;

const StyledRecords = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

export const RecordCalendarTimeline = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === recordIndexCalendarFieldMetadataId,
  );
  const { timeZone } = useDateTimeFormat();
  const dateLocale = useAtomStateValue(dateLocaleState);
  const monthGroups = useAtomComponentFamilySelectorValue(
    recordCalendarTimelineGroupsComponentSelector,
    { timeZone },
  );

  if (!isDefined(calendarFieldMetadataItem)) {
    return null;
  }

  return (
    <RecordFieldsScopeContextProvider
      value={{ scopeInstanceId: RECORD_CALENDAR_TIMELINE_INPUT_ID_PREFIX }}
    >
      <StyledTimeline>
        {monthGroups.map(({ month, days }) => {
          const plainYearMonth = Temporal.PlainYearMonth.from(month);
          const monthDate = plainYearMonth.toPlainDate({ day: 1 });

          return (
            <StyledMonth key={month}>
              <StyledMonthHeader>
                <StyledMonthName>
                  {monthDate.toLocaleString(dateLocale.locale, {
                    month: 'long',
                  })}
                </StyledMonthName>
                <StyledYear>{plainYearMonth.year}</StyledYear>
              </StyledMonthHeader>
              <StyledMonthDays>
                {days.map(({ day, recordIds }) => {
                  const plainDate = Temporal.PlainDate.from(day);

                  return (
                    <StyledDay key={day}>
                      <StyledDayLabel>
                        <StyledWeekday>
                          {plainDate.toLocaleString(dateLocale.locale, {
                            weekday: 'short',
                          })}
                        </StyledWeekday>
                        <StyledDayNumber>
                          {plainDate.day.toString().padStart(2, '0')}
                        </StyledDayNumber>
                      </StyledDayLabel>
                      <StyledDivider />
                      <StyledRecords>
                        {recordIds.map((recordId) => (
                          <RecordCalendarTimelineRecord
                            key={recordId}
                            calendarFieldName={calendarFieldMetadataItem.name}
                            calendarFieldType={calendarFieldMetadataItem.type}
                            recordId={recordId}
                          />
                        ))}
                      </StyledRecords>
                    </StyledDay>
                  );
                })}
              </StyledMonthDays>
            </StyledMonth>
          );
        })}
      </StyledTimeline>
    </RecordFieldsScopeContextProvider>
  );
};
