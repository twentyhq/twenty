import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { isRecordCalendarReadOnlyComponentState } from '@/object-record/record-calendar/states/isRecordCalendarReadOnlyComponentState';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonContainer = styled.div`
  height: auto;
  min-width: unset;
  padding: ${themeCssVariables.spacing['0.5']};
`;

type RecordCalendarAddNewProps = {
  cardDate: Temporal.PlainDate;
};

export const RecordCalendarAddNew = ({
  cardDate,
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

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const isCalendarFieldReadOnly = calendarFieldMetadataItem
    ? calendarFieldMetadataItem.isUIEditable === false ||
      isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      })
    : false;

  // Creating in a nested relation or junction widget requires picking the
  // related record, which only the table layout offers today.
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  if (
    isDefined(recordTableWidgetContext?.nestedRelationCreateThrough) ||
    isDefined(recordTableWidgetContext?.junctionCreateThrough) ||
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

  return (
    <StyledButtonContainer>
      <Button
        ariaLabel={t`Create record`}
        onClick={async (event) => {
          event.stopPropagation();

          const startDateTime = cardDate.toZonedDateTime({
            timeZone: userTimezone,
          });
          const startValue =
            calendarFieldMetadataItem.type === FieldMetadataType.DATE
              ? cardDate.toString()
              : startDateTime.toInstant().toString();

          await createNewIndexRecord({
            [calendarFieldMetadataItem.name]: startValue,
          });
        }}
        size="medium"
        type="button"
        variant="tertiary"
        Icon={() => <IconPlus size={theme.icon.size.sm} />}
      />
    </StyledButtonContainer>
  );
};
