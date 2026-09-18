import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ProgressRing } from '@/ui/feedback/progress-ring/components/ProgressRing';

type ProgressRingWithLabelProps = {
  value: number;
  label?: ReactNode;
  barColor?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  white-space: nowrap;
`;

export const ProgressRingWithLabel = ({
  value,
  label,
  barColor,
}: ProgressRingWithLabelProps) => (
  <StyledContainer>
    <span>{label ?? `${value}%`}</span>
    <ProgressRing size={14} value={value} barColor={barColor} />
  </StyledContainer>
);
