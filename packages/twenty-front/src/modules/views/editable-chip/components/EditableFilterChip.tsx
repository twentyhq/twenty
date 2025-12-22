import { useFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useFieldMetadataItemByIdOrThrow';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { useGetRecordFilterChipLabelValue } from '@/views/hooks/useGetRecordFilterChipLabelValue';

import { isNonEmptyString } from '@sniptt/guards';
import { useIcons } from 'twenty-ui/display';

type EditableFilterChipProps = {
  recordFilter: RecordFilter;
  onRemove: () => void;
  onClick?: () => void;
};

export const EditableFilterChip = ({
  recordFilter,
  onRemove,
  onClick,
}: EditableFilterChipProps) => {
  const { getIcon } = useIcons();

  const { fieldMetadataItem } = useFieldMetadataItemByIdOrThrow(
    recordFilter.fieldMetadataId,
  );

  const { getRecordFilterChipLabelValue } = useGetRecordFilterChipLabelValue();

  const FieldMetadataItemIcon = getIcon(fieldMetadataItem.icon);

  const recordFilterSubFieldName = recordFilter.subFieldName;

  const subFieldLabel =
    isCompositeFieldType(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilterSubFieldName) &&
    isValidSubFieldName(recordFilterSubFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilterSubFieldName,
        )
      : '';

  const fieldNameLabel = isNonEmptyString(subFieldLabel)
    ? `${recordFilter.label} / ${subFieldLabel}`
    : recordFilter.label;

  const labelKey = `${fieldNameLabel}`;
  const labelValue = getRecordFilterChipLabelValue({
    recordFilter,
  });

  return (
    <SortOrFilterChip
      key={recordFilter.id}
      testId={recordFilter.id}
      labelKey={labelKey}
      labelValue={labelValue}
      Icon={FieldMetadataItemIcon}
      onRemove={onRemove}
      onClick={onClick}
      type="filter"
    />
  );
};
