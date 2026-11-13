import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { AUDIO_BAR_COUNT } from '@/ui/feedback/audio-bars/constants/AudioBarCount';

const StyledBars = styled.span`
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  gap: 2px;
  height: 12px;
  width: 24px;
`;

const StyledBar = styled.span<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.extraLight};
  border-radius: 4px;
  flex: 1;
  height: 8px;
`;

type AudioBarsProps = {
  activeBars: number;
};

export const AudioBars = ({ activeBars }: AudioBarsProps) => (
  <StyledBars aria-hidden="true">
    {Array.from({ length: AUDIO_BAR_COUNT }, (_, index) => (
      <StyledBar key={index} isActive={index < activeBars} />
    ))}
  </StyledBars>
);
