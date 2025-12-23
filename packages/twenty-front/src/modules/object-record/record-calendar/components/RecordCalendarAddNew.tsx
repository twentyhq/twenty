import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { type Temporal } from 'temporal-polyfill';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';

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

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const recordIndexCalendarFieldMetadataId = useRecoilValue(
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
    hasAnySoftDeleteFilterOnView ||
    !hasObjectUpdatePermissions ||
    !calendarFieldMetadataItem ||
    isCalendarFieldReadOnly
  ) {
    return null;
  }

  return (
    <StyledButton
      onClick={() => {
        createNewIndexRecord({
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
