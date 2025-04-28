import { ConfigVariableSourceFilter } from '@/settings/admin-panel/config-variables/types/ConfigVariableSourceFilter';
import { SortOrFilterChip } from '@/views/components/SortOrFilterChip';
import styled from '@emotion/styled';

const StyledChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

type ConfigVariableFilterContainerProps = {
  children: React.ReactNode;
  activeChips: {
    label: string;
    onRemove: () => void;
    source?: ConfigVariableSourceFilter;
  }[];
};

export const ConfigVariableFilterContainer = ({
  children,
  activeChips,
}: ConfigVariableFilterContainerProps) => {
  return (
    <div>
      {children}
      {activeChips.length > 0 && (
        <StyledChipContainer>
          {activeChips.map((chip) => (
            <SortOrFilterChip
              key={chip.label}
              labelKey={chip.label}
              labelValue=""
              onRemove={chip.onRemove}
            />
          ))}
        </StyledChipContainer>
      )}
    </div>
  );
};
