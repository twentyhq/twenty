import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

type VariableChipStandaloneProps = {
  rawVariableName: string;
  onRemove?: () => void;
  isObject?: boolean;
};

export const VariableChipStandalone = ({
  rawVariableName,
  onRemove,
  isObject,
}: VariableChipStandaloneProps) => {
  return (
    <StyledContainer>
      <VariableChip
        rawVariableName={rawVariableName}
        onRemove={onRemove}
        isObject={isObject}
      />
    </StyledContainer>
  );
};
