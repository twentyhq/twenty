import { FullScreenContainer } from '@/ui/layout/fullscreen/components/FullScreenContainer';
import styled from '@emotion/styled';
import { action } from '@storybook/addon-actions';
import { type Decorator } from '@storybook/react';
const StyledT = styled.div`
  height: 100%;
  width: 100%;
`;

export const FullScreenDecorator: Decorator = (Story) => (
  <FullScreenContainer
    links={[
      {
        children: 'Layout',
        href: '/',
      },
      {
        children: 'FullScreen',
        href: '/',
      },
    ]}
    exitFullScreen={action('Full screen exit called.')}
  >
    <StyledT>
      <Story />
    </StyledT>
  </FullScreenContainer>
);
