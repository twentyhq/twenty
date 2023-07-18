import styled from '@emotion/styled';
import type { Meta, StoryObj } from '@storybook/react';

import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { ColorSchemeCard } from '../ColorSchemeCard';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const meta: Meta<typeof ColorSchemeCard> = {
  title: 'UI/ColorScheme/ColorSchemeCard',
  component: ColorSchemeCard,
};

export default meta;
type Story = StoryObj<typeof ColorSchemeCard>;

export const Default: Story = {
  render: getRenderWrapperForComponent(
    <Container>
      <ColorSchemeCard variant="light" selected={false} />
      <ColorSchemeCard variant="dark" selected={false} />
      <ColorSchemeCard variant="system" selected={false} />
    </Container>,
  ),
};

export const Selected: Story = {
  render: getRenderWrapperForComponent(
    <Container>
      <ColorSchemeCard variant="light" selected={true} />
      <ColorSchemeCard variant="dark" selected={true} />
      <ColorSchemeCard variant="system" selected={true} />
    </Container>,
  ),
};
