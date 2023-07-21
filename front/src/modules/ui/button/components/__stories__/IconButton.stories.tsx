import styled from '@emotion/styled';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconUser } from '@/ui/icon';

import { IconButton } from '../IconButton';

type IconButtonProps = React.ComponentProps<typeof IconButton>;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 20px;
  width: 800px;
  > * + * {
    margin-top: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledDescription = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-align: center;
  text-transform: uppercase;
`;

const StyledLine = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
`;

const StyledIconButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 50px;
`;

const meta: Meta<typeof IconButton> = {
  title: 'UI/Button/IconButton',
  component: IconButton,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
  ],
  argTypes: { icon: { control: false }, variant: { control: false } },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

const variants: IconButtonProps['variant'][] = [
  'transparent',
  'border',
  'shadow',
  'white',
];

const clickJestFn = jest.fn();

const states = {
  default: {
    description: 'Default',
    extraProps: (variant: string) => ({
      'data-testid': `${variant}-button-default`,
      onClick: clickJestFn,
    }),
  },
  hover: {
    description: 'Hover',
    extraProps: (variant: string) => ({
      id: `${variant}-button-hover`,
      'data-testid': `${variant}-button-hover`,
    }),
  },
  pressed: {
    description: 'Pressed',
    extraProps: (variant: string) => ({
      id: `${variant}-button-pressed`,
      'data-testid': `${variant}-button-pressed`,
    }),
  },
  disabled: {
    description: 'Disabled',
    extraProps: (variant: string) => ({
      'data-testid': `${variant}-button-disabled`,
      disabled: true,
    }),
  },
};

export const LargeSize: Story = {
  args: { size: 'large' },
  render: (args) => (
    <>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledTitle>{variant}</StyledTitle>
          <StyledLine>
            {Object.entries(states).map(
              ([state, { description, extraProps }]) => (
                <StyledIconButtonContainer
                  key={`${variant}-container-${state}`}
                >
                  <StyledDescription>{description}</StyledDescription>
                  <IconButton
                    {...args}
                    {...extraProps(variant ?? '')}
                    variant={variant}
                    icon={<IconUser size={args.size === 'small' ? 14 : 16} />}
                  />
                </StyledIconButtonContainer>
              ),
            )}
          </StyledLine>
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByTestId('transparent-button-default');

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(button);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
};

export const MediumSize: Story = {
  ...LargeSize,
  args: { size: 'medium' },
};

export const SmallSize: Story = {
  ...LargeSize,
  args: { size: 'small' },
};
