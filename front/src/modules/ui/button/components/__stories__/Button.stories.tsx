import React from 'react';
import styled from '@emotion/styled';
import { text, withKnobs } from '@storybook/addon-knobs';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconSearch } from '@/ui/icon';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Button } from '../Button';
import { ButtonGroup } from '../ButtonGroup';

type ButtonProps = React.ComponentProps<typeof Button>;

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
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

const meta: Meta<typeof Button> = {
  title: 'UI/Button/Button',
  component: Button,
  decorators: [withKnobs],
};

export default meta;
type Story = StoryObj<typeof Button>;

const variants: ButtonProps['variant'][] = [
  'primary',
  'secondary',
  'tertiary',
  'tertiaryBold',
  'tertiaryLight',
  'danger',
];

const clickJestFn = jest.fn();

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

const ButtonLine: React.FC<ButtonProps> = ({ variant, ...props }) => (
  <>
    {Object.entries(states).map(([state, { description, extraProps }]) => (
      <StyledButtonContainer key={`${variant}-container-${state}`}>
        <StyledDescription>{description}</StyledDescription>
        <Button {...props} {...extraProps(variant ?? '')} variant={variant} />
      </StyledButtonContainer>
    ))}
  </>
);

const ButtonGroupLine: React.FC<ButtonProps> = ({ variant, ...props }) => (
  <>
    {Object.entries(states).map(([state, { description, extraProps }]) => (
      <StyledButtonContainer key={`${variant}-group-container-${state}`}>
        <StyledDescription>{description}</StyledDescription>
        <ButtonGroup>
          <Button
            {...props}
            {...extraProps(`${variant}-left`)}
            variant={variant}
            title="Left"
          />
          <Button
            {...props}
            {...extraProps(`${variant}-center`)}
            variant={variant}
            title="Center"
          />
          <Button
            {...props}
            {...extraProps(`${variant}-right`)}
            variant={variant}
            title="Right"
          />
        </ButtonGroup>
      </StyledButtonContainer>
    ))}
  </>
);

const generateStory = (
  size: ButtonProps['size'],
  type: 'button' | 'group',
  LineComponent: React.ComponentType<ButtonProps>,
): Story => ({
  render: getRenderWrapperForComponent(
    <StyledContainer>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledTitle>{variant}</StyledTitle>
          <StyledLine>
            <LineComponent
              size={size}
              variant={variant}
              title={text('Text', 'A button title')}
            />
          </StyledLine>
        </div>
      ))}
    </StyledContainer>,
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    let button;
    if (type === 'group') {
      button = canvas.getByTestId(`primary-left-button-default`);
    } else {
      button = canvas.getByTestId(`primary-button-default`);
    }

    const numberOfClicks = clickJestFn.mock.calls.length;
    await userEvent.click(button);
    expect(clickJestFn).toHaveBeenCalledTimes(numberOfClicks + 1);
  },
  parameters: {
    pseudo: Object.keys(states).reduce(
      (acc, state) => ({
        ...acc,
        [state]: variants.map(
          (variant) =>
            variant &&
            ['#left', '#center', '#right'].map(
              (pos) => `${pos}-${variant}-${type}-${state}`,
            ),
        ),
      }),
      {},
    ),
  },
});

export const MediumSize = generateStory('medium', 'button', ButtonLine);
export const SmallSize = generateStory('small', 'button', ButtonLine);
export const MediumSizeGroup = generateStory(
  'medium',
  'group',
  ButtonGroupLine,
);
export const SmallSizeGroup = generateStory('small', 'group', ButtonGroupLine);
