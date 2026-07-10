import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID } from '@/object-record/record-calendar/record-calendar-card/constants/RecordCalendarCardClickOutsideId';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCard } from '@/object-record/record-card/components/RecordCard';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { formatInTimeZone } from 'date-fns-tz';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { Checkbox, CheckboxVariant } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const RECORD_CALENDAR_WEEK_HOUR_HEIGHT = 48;

const StyledEventPositioner = styled.div<{
  isAllDay: boolean;
  topInPixels: number;
}>`
  box-sizing: border-box;
  height: ${({ isAllDay }) => (isAllDay ? '22px' : '44px')};
  left: ${({ isAllDay }) => (isAllDay ? 'auto' : '4px')};
  min-width: 0;
  overflow: hidden;
  position: ${({ isAllDay }) => (isAllDay ? 'relative' : 'absolute')};
  right: ${({ isAllDay }) => (isAllDay ? 'auto' : '4px')};
  top: ${({ isAllDay, topInPixels }) =>
    isAllDay ? 'auto' : `${topInPixels + 2}px`};
  width: ${({ isAllDay }) => (isAllDay ? '100%' : 'auto')};
  z-index: 1;

  > div {
    height: 100%;
  }
`;

const StyledEventContent = styled.div<{ isAllDay: boolean }>`
  align-items: ${({ isAllDay }) => (isAllDay ? 'center' : 'flex-start')};
  box-sizing: border-box;
  display: flex;
  flex-direction: ${({ isAllDay }) => (isAllDay ? 'row' : 'column')};
  height: 100%;
  min-width: 0;
  overflow: hidden;
  padding: ${({ isAllDay }) =>
    isAllDay
      ? `0 ${themeCssVariables.spacing['0.5']}`
      : `${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]}`};
  position: relative;
  width: 100%;
`;

const StyledRecordChipContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  overflow: hidden;
  padding-right: ${themeCssVariables.spacing[5]};
  width: 100%;
`;

const StyledCheckboxContainer = styled.div<{ isAllDay: boolean }>`
  align-items: center;
  display: flex;
  height: 20px;
  position: absolute;
  right: ${({ isAllDay }) =>
    isAllDay ? themeCssVariables.spacing['0.5'] : themeCssVariables.spacing[1]};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledEventTimeRow = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
  min-width: 0;
  overflow: hidden;
  width: 100%;
`;

const StyledEventTime = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 12px;
  white-space: nowrap;
`;

type RecordCalendarWeekEventProps = {
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  isAllDay: boolean;
  recordId: string;
  timeFormat: string;
  timeZone: string;
};

export const RecordCalendarWeekEvent = ({
  calendarFieldName,
  calendarFieldType,
  isAllDay,
  recordId,
  timeFormat,
  timeZone,
}: RecordCalendarWeekEventProps) => {
  const { objectNameSingular } = useRecordCalendarContextOrThrow();
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const recordDate = recordStore?.[calendarFieldName];

  const [isRecordCalendarCardSelected, setIsRecordCalendarCardSelected] =
    useAtomComponentFamilyState(
      isRecordCalendarCardSelectedComponentFamilyState,
      recordId,
    );

  const isDateOnly = calendarFieldType === FieldMetadataType.DATE;

  if (
    !isDefined(recordStore) ||
    typeof recordDate !== 'string' ||
    isAllDay !== isDateOnly
  ) {
    return null;
  }

  const zonedDateTime = isDateOnly
    ? null
    : Temporal.Instant.from(recordDate).toZonedDateTimeISO(timeZone);
  const topInPixels = isDefined(zonedDateTime)
    ? (zonedDateTime.hour + zonedDateTime.minute / 60) *
      RECORD_CALENDAR_WEEK_HOUR_HEIGHT
    : 0;
  const eventTime = isDefined(zonedDateTime)
    ? formatInTimeZone(new Date(recordDate), timeZone, timeFormat)
    : null;

  return (
    <StyledEventPositioner isAllDay={isAllDay} topInPixels={topInPixels}>
      <RecordCard
        data-click-outside-id={RECORD_CALENDAR_CARD_CLICK_OUTSIDE_ID}
        data-selected={isRecordCalendarCardSelected}
        onClick={() => openRecordFromIndexView({ recordId })}
      >
        <StyledEventContent isAllDay={isAllDay}>
          <StyledRecordChipContainer>
            <RecordChip
              objectNameSingular={objectNameSingular}
              record={recordStore}
              variant={ChipVariant.Transparent}
              isBold
              isIconHidden
              maxWidth={128}
              forceDisableClick
              triggerEvent="CLICK"
            />
          </StyledRecordChipContainer>
          <StyledCheckboxContainer
            className="checkbox-container"
            isAllDay={isAllDay}
          >
            <StopPropagationContainer>
              <Checkbox
                hoverable
                checked={isRecordCalendarCardSelected}
                onChange={(event) => {
                  setIsRecordCalendarCardSelected(event.target.checked);
                }}
                variant={CheckboxVariant.Secondary}
              />
            </StopPropagationContainer>
          </StyledCheckboxContainer>
          {!isAllDay && isDefined(eventTime) && (
            <StyledEventTimeRow>
              <StyledEventTime>{eventTime}</StyledEventTime>
            </StyledEventTimeRow>
          )}
        </StyledEventContent>
      </RecordCard>
    </StyledEventPositioner>
  );
};
