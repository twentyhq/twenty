import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { isFieldMetadataReadOnlyByPermissions } from '@/object-record/read-only/utils/internal/isFieldMetadataReadOnlyByPermissions';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useRecordCalendarContextOrThrow } from '../contexts/RecordCalendarContext';

const StyledButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(0.5)};
  min-width: unset;
  height: auto;
`;

type RecordCalendarAddNewProps = {
  cardDate: string;
};

export const RecordCalendarAddNew = ({
  cardDate,
}: RecordCalendarAddNewProps) => {
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
          [calendarFieldMetadataItem.name]: cardDate,
        });
      }}
      variant="tertiary"
      Icon={() => <IconPlus size={theme.icon.size.sm} />}
    />
  );
};
