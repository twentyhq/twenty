import styled from '@emotion/styled';
import React from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { MOBILE_VIEWPORT } from 'twenty-ui/theme';
import { Step, type StepProps } from './Step';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    align-items: center;
    justify-content: center;
  }
`;

export type StepBarProps = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    activeStep: number;
  };

export const StepBar = ({ activeStep, children }: StepBarProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledContainer>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        // If the child is not a Step, return it as-is
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (child.type?.displayName !== Step.displayName) {
          return child;
        }

        // We should only render the active step, and if activeStep is -1, we should only render the first step only when it's mobile device
        if (
          isMobile &&
          (activeStep === -1 ? index !== 0 : index !== activeStep)
        ) {
          return null;
        }

        return React.cloneElement<StepProps>(child as any, {
          index,
          isLast: index === React.Children.count(children) - 1,
          activeStep,
        });
      })}
    </StyledContainer>
  );
};

StepBar.Step = Step;
