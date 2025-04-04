import { useGetFieldMetadataItemById } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
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

  const selectedFieldLabel = recordFilter?.label ?? '';

  return (
    <SelectControl
      selectedOption={{
        label: selectedFieldLabel,
        value: null,
        Icon: fieldIcon,
      }}
    />
  );
};
