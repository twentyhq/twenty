import { useAdvancedFilterDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterDropdown';
import { useCurrentViewFilter } from '@/object-record/advanced-filter/hooks/useCurrentViewFilter';
import { ObjectFilterDropdownFilterSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { advancedFilterViewFilterGroupIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterGroupIdComponentState';
import { advancedFilterViewFilterIdComponentState } from '@/object-record/object-filter-dropdown/states/advancedFilterViewFilterIdComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
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

  const filter = useCurrentViewFilter({ viewFilterId });

  const selectedFieldLabel = filter?.definition.label ?? '';

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
          setAdvancedFilterViewFilterId(filter?.id);
          setAdvancedFilterViewFilterGroupId(filter?.viewFilterGroupId);
        }}
        dropdownComponents={
          shouldShowCompositeSelectionSubMenu ? (
            <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu />
          ) : (
            <ObjectFilterDropdownFilterSelect />
          )
        }
        dropdownHotkeyScope={{ scope: ADVANCED_FILTER_DROPDOWN_ID }}
        dropdownOffset={{ y: 8, x: 0 }}
        dropdownPlacement="bottom-start"
      />
    </StyledContainer>
  );
};
