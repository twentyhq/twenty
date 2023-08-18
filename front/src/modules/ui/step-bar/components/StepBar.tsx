import React from 'react';
import styled from '@emotion/styled';

import { Step, StepProps } from './Step';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
`;

export type StepsProps = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    activeStep: number;
  };

export const StepBar = ({ children, activeStep, ...restProps }: StepsProps) => {
  return (
    <StyledContainer {...restProps}>
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

        return React.cloneElement<StepProps>(child as any, {
          index,
          isActive: index <= activeStep,
          isLast: index === React.Children.count(children) - 1,
        });
      })}
    </StyledContainer>
  );
};

StepBar.Step = Step;
