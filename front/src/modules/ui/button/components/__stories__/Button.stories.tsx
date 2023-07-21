import styled from '@emotion/styled';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconSearch } from '@/ui/icon';

import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

type ButtonProps = React.ComponentProps<typeof Button>;

const StyledContainer = styled.div`
  display: flex;
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
  justify-content: space-between;
  width: 100%;
`;

const StyledButtonContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.color.gray20};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const variants: ButtonProps['variant'][] = [
  'primary',
  'secondary',
  'tertiary',
  'tertiaryBold',
  'tertiaryLight',
  'danger',
];

const states = {
  'with-icon': {
    description: 'With icon',
    extraProps: (variant: string) => ({
      'data-testid': `${variant}-button-with-icon`,
      icon: <IconSearch size={14} />,
    }),
  },
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
  soon: {
    description: 'Soon',
    extraProps: (variant: string) => ({
      'data-testid': `${variant}-button-soon`,
      soon: true,
    }),
  },
  focus: {
    description: 'Focus',
    extraProps: (variant: string) => ({
      id: `${variant}-button-focus`,
      'data-testid': `${variant}-button-focus`,
    }),
  },
};

const meta: Meta<typeof Button> = {
  title: 'UI/Button/Button',
  component: Button,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
  ],
  parameters: {
    pseudo: Object.keys(states).reduce(
      (acc, state) => ({
        ...acc,
        [state]: variants.map(
          (variant) =>
            variant &&
            ['#left', '#center', '#right'].map(
              (pos) => `${pos}-${variant}-button-${state}`,
            ),
        ),
      }),
      {},
    ),
  },
  argTypes: { icon: { control: false }, variant: { control: false } },
  args: { title: 'A button title' },
};

export default meta;
type Story = StoryObj<typeof Button>;

const clickJestFn = jest.fn();

export const MediumSize: Story = {
  args: { size: 'medium' },
  render: (args) => (
    <>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledTitle>{variant}</StyledTitle>
          <StyledLine>
            {Object.entries(states).map(
              ([state, { description, extraProps }]) => (
                <StyledButtonContainer key={`${variant}-container-${state}`}>
                  <StyledDescription>{description}</StyledDescription>
                  <Button
                    {...args}
                    {...extraProps(variant ?? '')}
                    variant={variant}
                  />
                </StyledButtonContainer>
              ),
            )}
          </StyledLine>
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('primary-button-default');

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(button);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
};

export const SmallSize: Story = {
  ...MediumSize,
  args: { size: 'small' },
};

export const MediumSizeGroup: Story = {
  args: { size: 'medium' },
  render: (args) => (
    <>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledTitle>{variant}</StyledTitle>
          <StyledLine>
            {Object.entries(states).map(
              ([state, { description, extraProps }]) => (
                <StyledButtonContainer
                  key={`${variant}-group-container-${state}`}
                >
                  <StyledDescription>{description}</StyledDescription>
                  <ButtonGroup>
                    {['Left', 'Center', 'Right'].map((position) => (
                      <Button
                        {...args}
                        {...extraProps(`${variant}-${position.toLowerCase()}`)}
                        variant={variant}
                        title={position}
                      />
                    ))}
                  </ButtonGroup>
                </StyledButtonContainer>
              ),
            )}
          </StyledLine>
        </div>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('primary-left-button-default');

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(button);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
};

export const SmallSizeGroup: Story = {
  ...MediumSizeGroup,
  args: { size: 'small' },
};
