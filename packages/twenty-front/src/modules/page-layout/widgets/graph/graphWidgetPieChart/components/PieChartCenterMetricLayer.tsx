import styled from '@emotion/styled';

type PieChartCenterMetricProps = {
  value: string | number | undefined;
  label: string;
  show: boolean;
};

const StyledCenterMetricContainer = styled.div<{ show: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 50%;
  opacity: ${({ show }) => (show ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: opacity ${({ theme }) => theme.animation.duration.fast}s
    ease-in-out;
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: clamp(12px, 10cqmin, 48px);
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: clamp(10px, 5cqmin, 24px);
`;

export const PieChartCenterMetric = ({
  value,
  label,
  show,
}: PieChartCenterMetricProps) => {
  return (
    <StyledCenterMetricContainer show={show}>
      <StyledValue>{value}</StyledValue>
      <StyledLabel>{label}</StyledLabel>
    </StyledCenterMetricContainer>
  );
};
