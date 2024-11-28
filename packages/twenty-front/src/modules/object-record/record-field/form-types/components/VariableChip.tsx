import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

type VariableChipProps = {
  rawVariable: string;
  onRemove: () => void;
};

export const VariableChip = ({ rawVariable, onRemove }: VariableChipProps) => {
  return (
    <StyledContainer>
      <SortOrFilterChip
        labelValue={extractVariableLabel(rawVariable)}
        onRemove={onRemove}
      />
    </StyledContainer>
  );
};
