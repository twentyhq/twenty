import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { RecordCalendarTimelineFields } from '@/object-record/record-calendar/timeline/components/RecordCalendarTimelineFields';
import { formatRecordCalendarWeekEventTimes } from '@/object-record/record-calendar/week/utils/formatRecordCalendarWeekEventTimes';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const StyledRecord = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: 24px;
  min-width: 0;
`;

const StyledRecordContent = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[1]};

  &[data-focused='true'] {
    background: ${themeCssVariables.background.secondary};
  }
`;

const StyledTime = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex: 0 0 64px;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledRecordChip = styled.div`
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
`;

type RecordCalendarTimelineRecordProps = {
  calendarFieldName: string;
  calendarFieldType: FieldMetadataType;
  recordId: string;
};

export const RecordCalendarTimelineRecord = ({
  calendarFieldName,
  calendarFieldType,
  recordId,
}: RecordCalendarTimelineRecordProps) => {
  const { objectNameSingular } = useRecordCalendarContextOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const viewableRecordId = useAtomStateValue(viewableRecordIdState);
  const { openRecordFromIndexView } = useOpenRecordFromIndexView();
  const { timeFormat, timeZone } = useDateTimeFormat();

  if (!isDefined(recordStore)) {
    return null;
  }

  const calendarFieldValue = recordStore[calendarFieldName];
  const eventTimes = formatRecordCalendarWeekEventTimes({
    startDateTime: calendarFieldValue,
    timeFormat,
    timeZone,
  });
  const time =
    calendarFieldType === FieldMetadataType.DATE
      ? t`All Day`
      : (eventTimes?.startTime ?? '');

  return (
    <StyledRecord onClick={() => openRecordFromIndexView({ recordId })}>
      <StyledTime>{time}</StyledTime>
      <StyledRecordContent data-focused={viewableRecordId === recordId}>
        <StyledRecordChip>
          <RecordChip
            objectNameSingular={objectNameSingular}
            record={recordStore}
            variant={ChipVariant.Transparent}
            forceDisableClick
            triggerEvent="CLICK"
          />
        </StyledRecordChip>
        <RecordCalendarTimelineFields recordId={recordId} />
      </StyledRecordContent>
    </StyledRecord>
  );
};
