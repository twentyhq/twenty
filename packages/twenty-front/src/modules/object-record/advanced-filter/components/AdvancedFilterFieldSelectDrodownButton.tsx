import { AdvancedFilterFieldSelectDrodownContent } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDrodownContent';
import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';

import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  flex: 2;
`;

type AdvancedFilterFieldSelectDrodownButtonProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDrodownButton = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDrodownButtonProps) => {
  const { advancedFilterDropdownId } =
    useAdvancedFilterDropdown(recordFilterId);

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
        dropdownId={advancedFilterDropdownId}
        clickableComponent={
          <SelectControl
            selectedOption={{
              label: selectedFieldLabel,
              value: null,
            }}
          />
        }
        dropdownComponents={<AdvancedFilterFieldSelectDrodownContent />}
        dropdownHotkeyScope={{ scope: advancedFilterDropdownId }}
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
