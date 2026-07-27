import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonContainer = styled.div<{ compact: boolean }>`
  height: auto;
  min-width: unset;
  padding: ${({ compact }) => (compact ? 0 : themeCssVariables.spacing['0.5'])};
`;

type RecordCalendarAddNewProps = {
  cardDate: Temporal.PlainDate;
  cardTime?: Temporal.PlainTime;
  compact?: boolean;
};

export const RecordCalendarAddNew = ({
  cardDate,
  cardTime,
  compact = false,
}: RecordCalendarAddNewProps) => {
  const isRecordCalendarReadOnly = useAtomComponentStateValue(
    isRecordCalendarReadOnlyComponentState,
  );

  const { theme } = useContext(ThemeContext);
  const { userTimezone } = useUserTimezone();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const recordIndexCalendarEndFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );
  const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarEndFieldMetadataId,
  );

  const isCalendarFieldReadOnly = calendarFieldMetadataItem
    ? calendarFieldMetadataItem.isUIEditable === false ||
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      })
    : false;

  const isCalendarEndFieldReadOnly = calendarEndFieldMetadataItem
    ? calendarEndFieldMetadataItem.isUIEditable === false ||
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarEndFieldMetadataItem.id,
      })
    : false;

  if (
    isRecordCalendarReadOnly ||
    hasAnySoftDeleteFilterOnView === true ||
    !canCreateRecordsForObjectMetadataItem({
      objectPermissions,
      objectMetadataItem,
    }) ||
    calendarFieldMetadataItem === undefined ||
    isCalendarFieldReadOnly === true
  ) {
    return null;
  }

  const createRecordAriaLabel = cardTime
    ? t`Create record on ${cardDate.toLocaleString(undefined, {
        dateStyle: 'full',
      })} at ${cardTime.toLocaleString(undefined, { timeStyle: 'short' })}`
    : t`Create record`;

  return (
    <StyledButtonContainer compact={compact}>
      <Button
        ariaLabel={createRecordAriaLabel}
        onClick={async (event) => {
          event.stopPropagation();

          const startDateTime = cardDate.toZonedDateTime({
            timeZone: userTimezone,
            plainTime: cardTime,
          });
          const startValue =
            calendarFieldMetadataItem.type === FieldMetadataType.DATE
              ? cardDate.toString()
              : startDateTime.toInstant().toString();

          await createNewIndexRecord({
            [calendarFieldMetadataItem.name]: startValue,
            ...(calendarFieldMetadataItem.type === FieldMetadataType.DATE &&
              isCalendarEndFieldReadOnly === false &&
              calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE && {
                [calendarEndFieldMetadataItem.name]: cardDate.toString(),
              }),
            ...(calendarFieldMetadataItem.type ===
              FieldMetadataType.DATE_TIME &&
              isCalendarEndFieldReadOnly === false &&
              calendarEndFieldMetadataItem?.type ===
                FieldMetadataType.DATE_TIME && {
                [calendarEndFieldMetadataItem.name]: startDateTime
                  .add({ hours: 1 })
                  .toInstant()
                  .toString(),
              }),
          });
        }}
        size={compact ? 'small' : 'medium'}
        type="button"
        variant="tertiary"
        Icon={() => <IconPlus size={theme.icon.size.sm} />}
      />
    </StyledButtonContainer>
  );
};
