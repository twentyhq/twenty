import { styled } from '@linaria/react';

import { TIMELINE_ICON_SLOT_SIZE } from '@/activities/timeline-activities/constants/TimelineIconSlotSize';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';
import { themeCssVariables } from 'twenty-ui/theme';

export const StyledEventRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const StyledEventRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: space-between;
  min-height: ${TIMELINE_ICON_SLOT_SIZE}px;
`;

export const StyledEventRowContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

export const StyledEventRowLinkedRecord = styled.span`
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-decoration: underline;
  text-decoration-color: ${themeCssVariables.border.color.strong};
  text-overflow: ellipsis;
  text-underline-offset: 3px;
  transition: text-decoration-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
  white-space: nowrap;
  width: 100%;

  &:hover {
    text-decoration-color: currentColor;
  }
`;
