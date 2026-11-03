import { CoreAgentDataAccessExample } from '@/object-core/agents/components/__stories__/CoreAgentDataAccessExample';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CoreAgentDataAccessExample> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentDataAccess',
  component: CoreAgentDataAccessExample,
  decorators: [CatalogDecorator],
  parameters: { catalog: { options: { elementContainer: { width: 420 } } } },
};
export default meta;
type Story = StoryObj<typeof CoreAgentDataAccessExample>;

export const ReadDependenciesAndDiscard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const globalScope = within(
      canvas.getByRole('group', { name: 'All objects' }),
    );
    const companies = within(canvas.getByRole('group', { name: 'Companies' }));
    await userEvent.click(
      companies.getByRole('switch', { name: 'Edit records' }),
    );
    await expect(
      companies.getByRole('switch', { name: 'See records' }),
    ).toBeChecked();
    await expect(
      globalScope.getByRole('switch', { name: 'See records' }),
    ).not.toBeChecked();
    await userEvent.click(
      companies.getByRole('switch', { name: 'See records' }),
    );
    await expect(
      companies.getByRole('switch', { name: 'Edit records' }),
    ).not.toBeChecked();
    await userEvent.click(
      globalScope.getByRole('switch', { name: 'Delete records' }),
    );
    await expect(
      globalScope.getByRole('switch', { name: 'See records' }),
    ).toBeChecked();
    await expect(
      companies.getByRole('switch', { name: 'See records' }),
    ).not.toBeChecked();
    await userEvent.click(
      companies.getByRole('button', { name: 'Use global defaults' }),
    );
    await expect(
      companies.getByRole('switch', { name: 'See records' }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Discard settings' }),
    );
    await expect(
      globalScope.getByRole('switch', { name: 'See records' }),
    ).not.toBeChecked();
    await expect(
      companies.getByRole('switch', { name: 'See records' }),
    ).not.toBeChecked();
  },
};

export const SharedRole: Story = {
  args: { mode: 'shared' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('link', { name: 'Open in Roles' }),
    ).toHaveAttribute('target', '_blank');
    for (const control of canvas.getAllByRole('switch')) {
      await expect(control).toBeDisabled();
    }
  },
};

export const Loading: Story = {
  args: { mode: 'loading' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('Loading permissions…'),
    ).toBeVisible();
  },
};

export const ReadOnly: Story = {
  args: { mode: 'read-only' },
  play: async ({ canvasElement }) => {
    for (const control of within(canvasElement).getAllByRole('switch')) {
      await expect(control).toBeDisabled();
    }
  },
};

export const PrepareAndDiscardPrivateRole: Story = {
  args: { mode: 'no-role' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Prepare permissions' }),
    );
    const companies = within(canvas.getByRole('group', { name: 'Companies' }));
    await userEvent.click(
      companies.getByRole('switch', { name: 'Edit records' }),
    );
    await expect(
      companies.getByRole('switch', { name: 'See records' }),
    ).toBeChecked();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Discard settings' }),
    );
    await expect(
      canvas.getByRole('button', { name: 'Prepare permissions' }),
    ).toBeVisible();
    for (const control of canvas.getAllByRole('switch')) {
      await expect(control).toBeDisabled();
    }
  },
};
