import { AdvancedFilterFieldSelectDropdownButtonClickableSelect } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownButtonClickableSelect';
import { AdvancedFilterFieldSelectDropdownContent } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectDropdownContent';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components';

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
  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  return (
    <StyledContainer>
      <DropdownRoot
        dropdownId={advancedFilterFieldSelectDropdownId}
        type="picker"
        onOpenChange={(open) => {
          if (!open) {
            setObjectFilterDropdownSearchInput('');
          }
        }}
      >
        <Dropdown.Trigger render={<div />} nativeButton={false}>
          <AdvancedFilterFieldSelectDropdownButtonClickableSelect
            recordFilterId={recordFilterId}
          />
        </Dropdown.Trigger>
        <DropdownContent
          aria-label={t`Select field`}
          width={GenericDropdownContentWidth.ExtraLarge}
          sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
          align="start"
        >
          <AdvancedFilterFieldSelectDropdownContent
            recordFilterId={recordFilterId}
          />
        </DropdownContent>
      </DropdownRoot>
    </StyledContainer>
  );
};
