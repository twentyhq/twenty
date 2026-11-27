/* @license Enterprise */

import { styled } from '@linaria/react';
import { useContext } from 'react';

import { AdvancedFilterLogicalOperatorDropdown } from '@/object-record/advanced-filter/components/AdvancedFilterLogicalOperatorDropdown';
import { ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS } from '@/object-record/advanced-filter/constants/AdvancedFilterLogicalOperatorOptions';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledText = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  height: ${themeCssVariables.spacing[8]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledContainer = styled.div`
  align-items: start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  min-width: ${themeCssVariables.spacing[16]};
`;

type SettingsRoleRuleConditionLogicalOperatorCellProps = {
  index: number;
  recordFilterGroup: RecordFilterGroup;
};

export const SettingsRoleRuleConditionLogicalOperatorCell = ({
  index,
  recordFilterGroup,
}: SettingsRoleRuleConditionLogicalOperatorCellProps) => {
  const { t } = useLingui();
  const { readonly } = useContext(AdvancedFilterContext);

  const logicalOperatorOptions = ADVANCED_FILTER_LOGICAL_OPERATOR_OPTIONS.map(
    (option) => ({
      ...option,
      label: t(option.label),
    }),
  );

  const logicalOperatorLabel = logicalOperatorOptions.find(
    (option) => option.value === recordFilterGroup.logicalOperator,
  )?.label;

  if (index === 0) {
    return (
      <StyledContainer>
        <StyledText>{t`When`}</StyledText>
      </StyledContainer>
    );
  }

  if (index > 1) {
    return (
      <StyledContainer>
        <StyledText>{logicalOperatorLabel}</StyledText>
      </StyledContainer>
    );
  }

  if (readonly) {
    return (
      <StyledContainer>
        <Select
          dropdownWidth={GenericDropdownContentWidth.Narrow}
          dropdownId={`advanced-filter-logical-operator-${recordFilterGroup.id}`}
          value={recordFilterGroup.logicalOperator}
          options={logicalOperatorOptions}
          dropdownSideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
          disabled
        />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <AdvancedFilterLogicalOperatorDropdown
        recordFilterGroup={recordFilterGroup}
      />
    </StyledContainer>
  );
};
