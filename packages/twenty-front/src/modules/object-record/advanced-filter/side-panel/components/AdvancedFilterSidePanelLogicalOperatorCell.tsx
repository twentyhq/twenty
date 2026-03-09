import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS } from '@/object-record/advanced-filter/constants/AdvancedFilterLogicalOperatorOptions';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownOffset';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { capitalize } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledText = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
`;

const StyledContainer = styled.div`
  align-items: start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  min-width: ${themeCssVariables.spacing[20]};
`;

type AdvancedFilterSidePanelLogicalOperatorCellProps = {
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const AdvancedFilterSidePanelLogicalOperatorCell = ({
  index,
  recordFilterGroup,
}: AdvancedFilterSidePanelLogicalOperatorCellProps) => {
  const { readonly } = useContext(AdvancedFilterContext);

  return (
    <StyledContainer>
      {index === 0 ? (
        <StyledText>{t`Where`}</StyledText>
      ) : index === 1 ? (
        readonly ? (
          <Select
            dropdownWidth={GenericDropdownContentWidth.Narrow}
            dropdownId={`advanced-filter-logical-operator-${recordFilterGroup.id}`}
            value={recordFilterGroup.logicalOperator}
            options={ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS}
            dropdownOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_OFFSET}
            disabled
          />
        ) : (
          <AdvancedFilterLogicalOperatorDropdown
            recordFilterGroup={recordFilterGroup}
          />
        )
      ) : (
        <StyledText>
          {capitalize(recordFilterGroup.logicalOperator.toLowerCase())}
        </StyledText>
      )}
    </StyledContainer>
  );
};
