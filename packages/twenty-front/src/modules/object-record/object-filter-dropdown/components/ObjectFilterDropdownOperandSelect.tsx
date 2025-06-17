import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { useApplyObjectFilterDropdownOperand } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownOperand';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { subFieldNameUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/subFieldNameUsedInDropdownComponentState';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';
import { getOperandLabel } from '../utils/getOperandLabel';

const StyledDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
`;

export const ObjectFilterDropdownOperandSelect = () => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const subFieldNameUsedInDropdown = useRecoilComponentValueV2(
    subFieldNameUsedInDropdownComponentState,
  );

  const { applyObjectFilterDropdownOperand } =
    useApplyObjectFilterDropdownOperand();

  const { closeDropdown } = useDropdown();

  const operandsForFilterType = isDefined(fieldMetadataItemUsedInDropdown)
    ? getRecordFilterOperands({
        filterType: getFilterTypeFromFieldType(
          fieldMetadataItemUsedInDropdown.type,
        ),
        subFieldName: subFieldNameUsedInDropdown,
      })
    : [];

  const handleOperandChange = (newOperand: ViewFilterOperand) => {
    applyObjectFilterDropdownOperand(newOperand);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <StyledDropdownMenuItemsContainer>
        {operandsForFilterType.map((filterOperand, index) => (
          <MenuItem
            key={`select-filter-operand-${index}`}
            onClick={() => {
              handleOperandChange(filterOperand);
              closeDropdown();
            }}
            text={getOperandLabel(filterOperand)}
          />
        ))}
      </StyledDropdownMenuItemsContainer>
    </DropdownContent>
  );
};
