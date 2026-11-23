import { styled } from '@linaria/react';
import { type CSSProperties, type ReactNode } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const StyledFloatingCard = styled.div`
  animation: gettingStartedStepPreviewFloatingCardIn 900ms
    cubic-bezier(0.22, 1, 0.36, 1) both;
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.xs};
  gap: ${themeCssVariables.spacing[1]};
  line-height: 1.2;
  padding: ${themeCssVariables.spacing[2]};
  position: absolute;
  transform: var(--floating-card-transform);
  z-index: 1;

  @keyframes gettingStartedStepPreviewFloatingCardIn {
    from {
      opacity: 0;
      transform: var(--floating-card-entry-transform);
    }
    to {
      opacity: 1;
      transform: var(--floating-card-transform);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  &[data-color='neutral'] {
    background-color: ${themeCssVariables.background.primary};
    border: 1px solid ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.secondary};
    gap: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[3]};
  }

  &[data-color='orange'] {
    background-color: ${themeCssVariables.color.orange3};
    border-left: 2px solid ${themeCssVariables.color.orange11};
    color: ${themeCssVariables.color.orange11};
  }

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

type GettingStartedStepPreviewFloatingCardProps = {
  color: 'neutral' | 'orange';
  top: number;
  right: number;
  width: number;
  rotate: number;
  delayMs: number;
  children: ReactNode;
};

export const GettingStartedStepPreviewFloatingCard = ({
  color,
  top,
  right,
  width,
  rotate,
  delayMs,
  children,
}: GettingStartedStepPreviewFloatingCardProps) => (
  <StyledFloatingCard
    data-color={color}
    style={
      {
        top,
        right,
        width,
        animationDelay: `${delayMs}ms`,
        '--floating-card-transform': `rotate(${rotate}deg)`,
        '--floating-card-entry-transform': doNotTranslate(
          `translateY(10px) rotate(${rotate / 2}deg) scale(0.94)`,
        ),
      } as CSSProperties
    }
  >
    {children}
  </StyledFloatingCard>
);
