import { AdvancedFilterFieldSelectDropdownContent } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownContent';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  flex: 2;
`;

type AdvancedFilterFieldSelectDropdownButtonProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownButton = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownButtonProps) => {
  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === recordFilterId,
  );

  const selectedFieldLabel = recordFilter?.label ?? '';

  return (
    <StyledContainer>
      <Dropdown
        dropdownId={advancedFilterFieldSelectDropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label: selectedFieldLabel,
              value: null,
            }}
          />
        }
        dropdownComponents={
          <AdvancedFilterFieldSelectDropdownContent
            recordFilterId={recordFilterId}
          />
        }
        dropdownHotkeyScope={{ scope: advancedFilterFieldSelectDropdownId }}
        dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
