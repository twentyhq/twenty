import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type Temporal } from 'temporal-polyfill';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(0.5)};
  min-width: unset;
  height: auto;
`;

type RecordCalendarAddNewProps = {
  cardDate: Temporal.PlainDate;
};

export const RecordCalendarAddNew = ({
  cardDate,
}: RecordCalendarAddNewProps) => {
  const { userTimezone } = useUserTimezone();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const theme = useTheme();

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const recordIndexCalendarFieldMetadataId = useAtomStateValue(
    recordIndexCalendarFieldMetadataIdState,
  );

  const calendarFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexCalendarFieldMetadataId,
  );

  const isCalendarFieldReadOnly = calendarFieldMetadataItem
    ? isFieldMetadataReadOnlyByPermissions({
        objectPermissions,
        fieldMetadataId: calendarFieldMetadataItem.id,
      })
    : false;

  if (
    hasAnySoftDeleteFilterOnView === true ||
    hasObjectUpdatePermissions === false ||
    calendarFieldMetadataItem === undefined ||
    isCalendarFieldReadOnly === true
  ) {
    return null;
  }

  return (
    <StyledButton
      onClick={async () => {
        await createNewIndexRecord({
          [calendarFieldMetadataItem.name]: cardDate
            .toZonedDateTime(userTimezone)
            .toInstant()
            .toString(),
        });
      }}
      variant="tertiary"
      Icon={() => <IconPlus size={theme.icon.size.sm} />}
    />
  );
};
