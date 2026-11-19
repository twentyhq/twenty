import { Select } from '@/ui/input/components/Select';
import { CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET } from '@/ui/layout/condition-builder/constants/ConditionBuilderDropdownSideOffset';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

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

type ConditionBuilderLogicalOperatorCellProps<TValue extends string> = {
  index: number;
  value: TValue;
  options: { value: TValue; label: string }[];
  onChange: (value: TValue) => void;
  isReadOnly: boolean;
  dropdownId: string;
  firstLabel: ReactNode;
  laterLabel: string;
};

export const ConditionBuilderLogicalOperatorCell = <TValue extends string>({
  index,
  value,
  options,
  onChange,
  isReadOnly,
  dropdownId,
  firstLabel,
  laterLabel,
}: ConditionBuilderLogicalOperatorCellProps<TValue>) => (
  <StyledContainer>
    {index === 0 ? (
      <StyledText>{firstLabel}</StyledText>
    ) : index === 1 ? (
      isReadOnly ? (
        <Select
          dropdownWidth={GenericDropdownContentWidth.Narrow}
          dropdownId={dropdownId}
          value={value}
          options={options}
          dropdownSideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
          disabled
        />
      ) : (
        <Select
          dropdownWidth={GenericDropdownContentWidth.Narrow}
          dropdownId={dropdownId}
          value={value}
          onChange={onChange}
          options={options}
          dropdownSideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
        />
      )
    ) : (
      <StyledText>{laterLabel}</StyledText>
    )}
  </StyledContainer>
);
