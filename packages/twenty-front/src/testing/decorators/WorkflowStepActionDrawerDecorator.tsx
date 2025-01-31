import styled from '@emotion/styled';
import { Decorator } from '@storybook/react';

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const WorkflowStepActionDrawerDecorator: Decorator = (Story) => (
  <StyledWrapper>
    <Story />
  </StyledWrapper>
);
