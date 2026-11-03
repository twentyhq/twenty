import { CoreAgentToolsExample } from '@/object-core/agents/components/__stories__/CoreAgentToolsExample';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { CatalogDecorator } from 'twenty-ui/testing';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';

const meta: Meta<typeof CoreAgentToolsExample> = {
  title: 'Modules/ObjectCore/Agents/CoreAgentTools',
  component: CoreAgentToolsExample,
  decorators: [CatalogDecorator, IconsProviderDecorator],
  parameters: { catalog: { options: { elementContainer: { width: 460 } } } },
};
export default meta;
type Story = StoryObj<typeof CoreAgentToolsExample>;

export const SearchAndEditWildcardTools: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = await canvas.findByRole('textbox', { name: 'Tools' });
    await userEvent.type(search, 'research');
    const researchTool = await canvas.findByRole('switch', {
      name: 'Research company',
    });
    await expect(researchTool).toBeChecked();
    await userEvent.click(researchTool);
    await expect(researchTool).not.toBeChecked();
    for (const summary of canvas.getAllByText('Settings access: Workspace')) {
      await expect(summary).toBeVisible();
    }
    await userEvent.clear(search);
    await expect(
      canvas.getByRole('switch', { name: 'HTTP Request' }),
    ).toBeChecked();
    await expect(
      canvas.queryByRole('switch', { name: 'Ask AI' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Discard settings' }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('switch', { name: 'Research company' }),
      ).toBeChecked(),
    );
  },
};
