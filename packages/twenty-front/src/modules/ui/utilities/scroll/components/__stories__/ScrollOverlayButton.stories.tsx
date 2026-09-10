import { ScrollOverlayButton } from '@/ui/utilities/scroll/components/ScrollOverlayButton';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { IconArrowDown } from 'twenty-ui/icon';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollAreaMock = styled.div`
  background: ${themeCssVariables.background.secondary};
  height: 120px;
  position: relative;
  width: 320px;
`;

const meta: Meta<typeof ScrollOverlayButton> = {
  title: 'UI/Utilities/Scroll/ScrollOverlayButton',
  component: ScrollOverlayButton,
  decorators: [
    (Story) => (
      <StyledScrollAreaMock>
        <Story />
      </StyledScrollAreaMock>
    ),
    ComponentDecorator,
  ],
  args: {
    isVisible: true,
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof ScrollOverlayButton>;

export const IconOnly: Story = {
  args: {
    Icon: IconArrowDown,
    ariaLabel: 'Scroll to bottom',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Scroll to bottom' }),
    );

    expect(args.onClick).toHaveBeenCalled();
  },
};

export const WithTitle: Story = {
  args: {
    ariaLabel: 'Jump to current',
    title: 'Jump to current',
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', {
      name: 'Jump to current',
    });

    expect(button).toBeVisible();

    await userEvent.click(button);

    expect(args.onClick).toHaveBeenCalled();
  },
};

export const Hidden: Story = {
  args: {
    ariaLabel: 'Jump to current',
    isVisible: false,
    title: 'Jump to current',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      canvas.queryByRole('button', { name: 'Jump to current' }),
    ).not.toBeInTheDocument();
  },
};
