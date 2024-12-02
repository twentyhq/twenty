import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

type VariableChipProps = {
  rawVariableName: string;
  onRemove: () => void;
};

export const VariableChip = ({
  rawVariableName,
  onRemove,
}: VariableChipProps) => {
  return (
    <StyledContainer>
      <SortOrFilterChip
        labelValue={extractVariableLabel(rawVariableName)}
        onRemove={onRemove}
      />
    </StyledContainer>
  );
};
