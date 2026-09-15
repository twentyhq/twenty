import { isDefined } from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ProgressRingWithLabel } from '@/ui/feedback/progress-ring/components/ProgressRingWithLabel';

type UsageProgressRowProps = {
  Icon: IconComponent;
  label: string;
  value: number | null;
  valueLabel?: ReactNode;
  barColor?: string;
};

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: 24px;
`;

const StyledLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

export const UsageProgressRow = ({
  Icon,
  label,
  value,
  valueLabel,
  barColor,
}: UsageProgressRowProps) => (
  <StyledRow>
    <StyledLabel>
      <Icon size={14} />
      <span>{label}</span>
    </StyledLabel>
    {!isDefined(value) ? (
      <span>{valueLabel ?? '—'}</span>
    ) : (
      <ProgressRingWithLabel
        value={value}
        label={valueLabel}
        barColor={barColor}
      />
    )}
  </StyledRow>
);
