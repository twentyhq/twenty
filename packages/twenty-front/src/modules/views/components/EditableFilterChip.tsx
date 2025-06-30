import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { getRecordFilterLabelValue } from '@/views/utils/getRecordFilterLabelValue';
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

  const { fieldMetadataItem } = useFieldMetadataItemById(
    recordFilter.fieldMetadataId,
  );

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
  const labelValue = getRecordFilterLabelValue(recordFilter);

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
