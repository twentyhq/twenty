import styled from '@emotion/styled';

import { useRecordPickerGetRecordAndObjectMetadataItemFromRecordId } from '@/object-record/record-picker/hooks/useRecordPickerGetRecordAndObjectMetadataItemFromRecordId';
import { MultipleRecordPickerMenuItemContent } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPickerMenuItemContent';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { isDefined } from 'twenty-shared';

export const StyledSelectableItem = styled(SelectableItem)`
  height: 100%;
  width: 100%;
`;

type MultipleRecordPickerMenuItemProps = {
  recordId: string;
  onChange?: (changedRecordForSelectId: string) => void;
};

export const MultipleRecordPickerMenuItem = ({
  recordId,
  onChange,
}: MultipleRecordPickerMenuItemProps) => {
  const { record, objectMetadataItem } =
    useRecordPickerGetRecordAndObjectMetadataItemFromRecordId({
      recordId,
    });

  if (!isDefined(record) || !isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <MultipleRecordPickerMenuItemContent
      record={record}
      objectMetadataItem={objectMetadataItem}
      onChange={onChange}
    />
  );
};
