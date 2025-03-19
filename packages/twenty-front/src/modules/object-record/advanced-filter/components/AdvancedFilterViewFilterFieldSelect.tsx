import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';

import { ObjectFilterDropdownFilterSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  flex: 2;
`;

type AdvancedFilterViewFilterFieldSelectProps = {
  viewFilterId: string;
};

export const AdvancedFilterViewFilterFieldSelect = ({
  viewFilterId,
}: AdvancedFilterViewFilterFieldSelectProps) => {
  const { advancedFilterDropdownId } = useAdvancedFilterDropdown(viewFilterId);

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (recordFilter) => recordFilter.id === viewFilterId,
  );

  const selectedFieldLabel = recordFilter?.label ?? '';

  const setAdvancedFilterViewFilterId = useSetRecoilComponentStateV2(
    advancedFilterViewFilterIdComponentState,
  );

  const setAdvancedFilterViewFilterGroupId = useSetRecoilComponentStateV2(
    advancedFilterViewFilterGroupIdComponentState,
  );

  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

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
        onOpen={() => {
          setAdvancedFilterViewFilterId(recordFilter?.id);
          setAdvancedFilterViewFilterGroupId(recordFilter?.recordFilterGroupId);
        }}
        dropdownComponents={
          shouldShowCompositeSelectionSubMenu ? (
            <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu />
          ) : (
            <ObjectFilterDropdownFilterSelect />
          )
        }
        dropdownHotkeyScope={{ scope: advancedFilterDropdownId }}
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
