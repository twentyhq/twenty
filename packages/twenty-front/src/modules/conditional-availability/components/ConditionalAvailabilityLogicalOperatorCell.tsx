import { useConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { getConditionalAvailabilityLogicalOperatorLabel } from '@/conditional-availability/utils/getConditionalAvailabilityLogicalOperatorLabel';
import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { doNotTranslate } from 'twenty-shared/i18n';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';
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

type ConditionalAvailabilityLogicalOperatorCellProps = {
  index: number;
  groupId: string | null;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
};

export const ConditionalAvailabilityLogicalOperatorCell = ({
  index,
  groupId,
  logicalOperator,
}: ConditionalAvailabilityLogicalOperatorCellProps) => {
  const { t } = useLingui();
  const { itemKey, isReadOnly, setLogicalOperator } =
    useConditionalAvailabilityEditorContext();

  if (index === 0) {
    return (
      <StyledContainer>
        <StyledText>{t`Where`}</StyledText>
      </StyledContainer>
    );
  }

  if (index > 1) {
    return (
      <StyledContainer>
        <StyledText>
          {getConditionalAvailabilityLogicalOperatorLabel({ logicalOperator })}
        </StyledText>
      </StyledContainer>
    );
  }

  const logicalOperators: ConditionalAvailabilityLogicalOperator[] = [
    doNotTranslate('AND'),
    doNotTranslate('OR'),
  ];
  const options = logicalOperators.map((value) => ({
    value,
    label: getConditionalAvailabilityLogicalOperatorLabel({
      logicalOperator: value,
    }),
  }));

  return (
    <StyledContainer>
      <Select
        dropdownWidth={GenericDropdownContentWidth.Narrow}
        dropdownId={`conditional-availability-logical-operator-${itemKey}-${groupId ?? 'root'}`}
        value={logicalOperator}
        onChange={(nextLogicalOperator) =>
          setLogicalOperator(groupId, nextLogicalOperator)
        }
        options={options}
        dropdownSideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
        disabled={isReadOnly}
      />
    </StyledContainer>
  );
};
