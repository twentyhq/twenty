import { useState } from 'react';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
`;

const StyledProgressBarItemContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledProgressBarItem = styled.div<{
  isFirst: boolean;
  isLast: boolean;
  isActive: boolean;
}>`
  background-color: ${({ theme, isActive }) =>
    isActive
      ? theme.font.color.secondary
      : theme.background.transparent.medium};
  border-bottom-left-radius: ${({ theme, isFirst }) =>
    isFirst ? theme.border.radius.sm : theme.border.radius.xs};
  border-bottom-right-radius: ${({ theme, isLast }) =>
    isLast ? theme.border.radius.sm : theme.border.radius.xs};
  border-top-left-radius: ${({ theme, isFirst }) =>
    isFirst ? theme.border.radius.sm : theme.border.radius.xs};
  border-top-right-radius: ${({ theme, isLast }) =>
    isLast ? theme.border.radius.sm : theme.border.radius.xs};
  height: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(3)};
`;

const StyledProgressBarContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
`;

const StyledLabel = styled.div`
  width: ${({ theme }) => theme.spacing(12)};
`;

const PROBABILITY_VALUES = [
  { label: '0%', value: 0 },
  { label: '25%', value: 25 },
  { label: '50%', value: 50 },
  { label: '75%', value: 75 },
  { label: '100%', value: 100 },
];

type ProbabilityInputProps = {
  probabilityIndex: number | null;
  onChange: (newValue: number) => void;
};

export const ProbabilityInput = ({
  onChange,
  probabilityIndex,
}: ProbabilityInputProps) => {
  const [hoveredProbabilityIndex, setHoveredProbabilityIndex] = useState<
    number | null
  >(null);

  const probabilityIndexToShow =
    hoveredProbabilityIndex ?? probabilityIndex ?? 0;

  return (
    <StyledContainer>
      <StyledLabel>
        {PROBABILITY_VALUES[probabilityIndexToShow].label}
      </StyledLabel>
      <StyledProgressBarContainer>
        {PROBABILITY_VALUES.map((probability, probabilityIndexToSelect) => (
          <StyledProgressBarItemContainer
            key={probabilityIndexToSelect}
            onClick={() => onChange(probability.value)}
            onMouseEnter={() =>
              setHoveredProbabilityIndex(probabilityIndexToSelect)
            }
            onMouseLeave={() => setHoveredProbabilityIndex(null)}
          >
            <StyledProgressBarItem
              isActive={
                hoveredProbabilityIndex || hoveredProbabilityIndex === 0
                  ? probabilityIndexToSelect <= hoveredProbabilityIndex
                  : probabilityIndexToSelect <= probabilityIndexToShow
              }
              key={probability.label}
              isFirst={probabilityIndexToSelect === 0}
              isLast={
                probabilityIndexToSelect === PROBABILITY_VALUES.length - 1
              }
            />
          </StyledProgressBarItemContainer>
        ))}
      </StyledProgressBarContainer>
    </StyledContainer>
  );
};
