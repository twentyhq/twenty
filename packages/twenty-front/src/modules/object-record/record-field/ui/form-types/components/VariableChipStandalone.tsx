import { VariableChip } from '@/object-record/record-field/ui/form-types/components/VariableChip';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${themeCssVariables.spacing[2]};
`;

type VariableChipStandaloneProps = {
  rawVariableName: string;
  onRemove?: () => void;
  isFullRecord?: boolean;
};

export const VariableChipStandalone = ({
  rawVariableName,
  onRemove,
  isFullRecord,
}: VariableChipStandaloneProps) => {
  return (
    <StyledContainer>
      <VariableChip
        rawVariableName={rawVariableName}
        onRemove={onRemove}
        isFullRecord={isFullRecord}
      />
    </StyledContainer>
  );
};
