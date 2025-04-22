import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

type AdvancedFilterFieldSelectDropdownButtonClickableSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownButtonClickableSelect = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownButtonClickableSelectProps) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const fieldMetadataItem = isNonEmptyString(recordFilter?.fieldMetadataId)
    ? getFieldMetadataItemById(recordFilter?.fieldMetadataId)
    : undefined;

  const { getIcon } = useIcons();

  const fieldIcon = isDefined(fieldMetadataItem?.icon)
    ? getIcon(fieldMetadataItem?.icon)
    : undefined;

  const subFieldLabel =
    isDefined(fieldMetadataItem) &&
    isCompositeField(fieldMetadataItem.type) &&
    isNonEmptyString(recordFilter?.subFieldName) &&
    isValidSubFieldName(recordFilter.subFieldName)
      ? getCompositeSubFieldLabel(
          fieldMetadataItem.type,
          recordFilter.subFieldName,
        )
      : '';

  const fieldNameLabel = isNonEmptyString(subFieldLabel)
    ? `${recordFilter?.label} / ${subFieldLabel}`
    : (recordFilter?.label ?? '');

  return (
    <SelectControl
      selectedOption={{
        label: fieldNameLabel,
        value: null,
        Icon: fieldIcon,
      }}
    />
  );
};
