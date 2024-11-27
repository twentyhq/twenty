import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import { extractVariableLabel } from '@/workflow/search-variables/utils/extractVariableLabel';
import styled from '@emotion/styled';

export const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

type SelectedVariableChipProps = {
  rawVariable: string;
  onRemove: () => void;
};

export const SelectedVariableChip = ({
  rawVariable,
  onRemove,
}: SelectedVariableChipProps) => {
  return (
    <StyledContainer>
      <SortOrFilterChip
        labelValue={extractVariableLabel(rawVariable)}
        onRemove={onRemove}
      />
    </StyledContainer>
  );
};
