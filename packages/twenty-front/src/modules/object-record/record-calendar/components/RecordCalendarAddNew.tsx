import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { IconPlus } from 'twenty-ui/display';
import { useRecordCalendarContextOrThrow } from '../contexts/RecordCalendarContext';
import { Button } from 'twenty-ui/input';
import { useRecoilValue } from 'recoil';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';

type RecordCalendarAddNewProps = {
  cardDate: string;
};

export const RecordCalendarAddNew = ({
  cardDate,
}: RecordCalendarAddNewProps) => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();

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

  if (
    hasAnySoftDeleteFilterOnView ||
    !hasObjectUpdatePermissions ||
    !calendarFieldMetadataItem
  ) {
    return null;
  }

  return (
    <Button
      onClick={() => {
        createNewIndexRecord({
          [calendarFieldMetadataItem?.name]: cardDate,
        });
      }}
      variant="tertiary"
      Icon={IconPlus}
    />
  );
};
