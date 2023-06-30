import styled from '@emotion/styled';
import { text, withKnobs } from '@storybook/addon-knobs';
import { expect, jest } from '@storybook/jest';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';

import { IconSearch } from '@/ui/icons';
import { getRenderWrapperForComponent } from '~/testing/renderWrappers';

import { Button } from '../Button';

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
  title: 'UI/Buttons/Button',
  component: Button,
  decorators: [withKnobs],
};

export default meta;
type Story = StoryObj<typeof Button>;

const clickJestFn = jest.fn();

const variants: ButtonProps['variant'][] = [
  'primary',
  'secondary',
  'tertiary',
  'tertiaryBold',
  'tertiaryLight',
  'danger',
];

const ButtonLine = (props: ButtonProps) => (
  <>
    <StyledButtonContainer>
      <StyledDescription>With icon</StyledDescription>
      <Button
        data-testid={`${props.variant}-button-with-icon`}
        {...props}
        icon={<IconSearch size={14} />}
      />
    </StyledButtonContainer>
    <StyledButtonContainer>
      <StyledDescription>Default</StyledDescription>
      <Button
        data-testid={`${props.variant}-button-default`}
        onClick={clickJestFn}
        {...props}
      />
    </StyledButtonContainer>
    <StyledButtonContainer>
      <StyledDescription>Hover</StyledDescription>
      <Button
        id={`${props.variant}-button-hover`}
        data-testid={`${props.variant}-button-hover`}
        {...props}
      />
    </StyledButtonContainer>
    <StyledButtonContainer>
      <StyledDescription>Pressed</StyledDescription>
      <Button
        id={`${props.variant}-button-pressed`}
        data-testid={`${props.variant}-button-pressed`}
        {...props}
      />
    </StyledButtonContainer>
    <StyledButtonContainer>
      <StyledDescription>Disabled</StyledDescription>
      <Button
        data-testid={`${props.variant}-button-disabled`}
        {...props}
        disabled
      />
    </StyledButtonContainer>
    <StyledButtonContainer>
      <StyledDescription>Focus</StyledDescription>
      <Button
        id={`${props.variant}-button-focus`}
        data-testid={`${props.variant}-button-focus`}
        {...props}
      />
    </StyledButtonContainer>
  </>
);

const ButtonContainer = (props: Partial<ButtonProps>) => {
  const title = text('Text', 'A button title');

  return (
    <StyledContainer>
      {variants.map((variant) => (
        <div key={variant}>
          <StyledTitle>{variant}</StyledTitle>
          <StyledLine>
            <ButtonLine {...props} title={title} variant={variant} />
          </StyledLine>
        </div>
      ))}
    </StyledContainer>
  );
};

// Medium size
export const MediumSize: Story = {
  render: getRenderWrapperForComponent(<ButtonContainer />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);

    const button = canvas.getByTestId('primary-button-default');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
MediumSize.parameters = {
  pseudo: {
    hover: [
      '#primary-button-hover',
      '#secondary-button-hover',
      '#tertiary-button-hover',
      '#tertiaryBold-button-hover',
      '#tertiaryLight-button-hover',
      '#danger-button-hover',
    ],
    active: [
      '#primary-button-pressed',
      '#secondary-button-pressed',
      '#tertiary-button-pressed',
      '#tertiaryBold-button-pressed',
      '#tertiaryLight-button-pressed',
      '#danger-button-pressed',
    ],
    focus: [
      '#primary-button-focus',
      '#secondary-button-focus',
      '#tertiary-button-focus',
      '#tertiaryBold-button-focus',
      '#tertiaryLight-button-focus',
      '#danger-button-focus',
    ],
  },
};

// Small size
export const SmallSize: Story = {
  render: getRenderWrapperForComponent(<ButtonContainer size="small" />),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(clickJestFn).toHaveBeenCalledTimes(0);

    const button = canvas.getByTestId('primary-button-default');
    await userEvent.click(button);

    expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
SmallSize.parameters = {
  pseudo: {
    hover: [
      '#primary-button-hover',
      '#secondary-button-hover',
      '#tertiary-button-hover',
      '#tertiaryBold-button-hover',
      '#tertiaryLight-button-hover',
      '#danger-button-hover',
    ],
    active: [
      '#primary-button-pressed',
      '#secondary-button-pressed',
      '#tertiary-button-pressed',
      '#tertiaryBold-button-pressed',
      '#tertiaryLight-button-pressed',
      '#danger-button-pressed',
    ],
    focus: [
      '#primary-button-focus',
      '#secondary-button-focus',
      '#tertiary-button-focus',
      '#tertiaryBold-button-focus',
      '#tertiaryLight-button-focus',
      '#danger-button-focus',
    ],
  },
};
