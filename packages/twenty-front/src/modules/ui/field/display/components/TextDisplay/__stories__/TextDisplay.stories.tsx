import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { ComponentDecorator } from 'twenty-ui/testing';

import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

const meta: Meta<typeof TextDisplay> = {
  title: 'UI/Data Display/TextDisplay',
  component: TextDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof TextDisplay>;

export const Default: Story = {
  args: {
    text: 'Some text content',
  },
  parameters: {
    container: { width: 100 },
  },
};

export const MultiLine: Story = {
  args: {
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    displayedMaxRows: 2,
  },
  parameters: {
    container: { width: 100 },
  },
};

export const WithoutTooltip: Story = {
  args: {
    text: 'Some long text with a https://twenty.com link',
    withTooltip: false,
    displayedMaxRows: 1,
  },
  parameters: {
    container: { width: 100 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'https://twenty.com' });
    const textContainer = link.parentElement;

    if (!isDefined(textContainer)) {
      throw new Error('Text must have a container');
    }

    await expect(link).toHaveAttribute('href', 'https://twenty.com');
    await expect(getComputedStyle(textContainer).webkitLineClamp).toBe('1');
    await expect(textContainer.scrollHeight).toBeGreaterThan(
      textContainer.clientHeight,
    );
    await userEvent.hover(link);
    await expect(
      within(document.body).findByRole('tooltip', {}, { timeout: 700 }),
    ).rejects.toThrow();
  },
};
