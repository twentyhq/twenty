import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { getAdvancedFilterInputPlaceholderText } from '@/object-record/advanced-filter/utils/getAdvancedFilterInputPlacedholderText';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from 'twenty-shared/utils';

type AdvancedFilterValueInputDropdownButtonClickableSelectProps = {
  recordFilterId: string;
};

export const AdvancedFilterValueInputDropdownButtonClickableSelect = ({
  recordFilterId,
}: AdvancedFilterValueInputDropdownButtonClickableSelectProps) => {
  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const isDisabled =
    !isDefined(recordFilter?.fieldMetadataId) ||
    !isDefined(recordFilter.operand);

  const shouldUsePlaceholder = !isNonEmptyString(recordFilter?.value);

  const { getFieldMetadataItemById } = useGetFieldMetadataItemById();

  const fieldMetadataItem = isNonEmptyString(recordFilter?.fieldMetadataId)
    ? getFieldMetadataItemById(recordFilter?.fieldMetadataId)
    : undefined;

  const placeholderText = isDefined(fieldMetadataItem)
    ? getAdvancedFilterInputPlaceholderText(fieldMetadataItem)
    : 'Enter filter';

  const advancedFilterInputText = shouldUsePlaceholder
    ? placeholderText
    : (recordFilter?.displayValue ?? '');

  return (
    <SelectControl
      selectedOption={{
        label: advancedFilterInputText,
        value: null,
        disabled: isDisabled,
      }}
      textAccent={shouldUsePlaceholder ? 'placeholder' : 'default'}
    />
  );
};
