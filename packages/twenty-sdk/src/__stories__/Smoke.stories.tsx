import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

const SmokeTest = () => (
  <div data-testid="smoke-test" style={{ padding: 20 }}>
    Storybook is working
  </div>
);

const meta: Meta<typeof SmokeTest> = {
  title: 'Smoke/SmokeTest',
  component: SmokeTest,
};

export default meta;
type Story = StoryObj<typeof SmokeTest>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const element = await canvas.findByTestId('smoke-test');
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Storybook is working');
  },
};
