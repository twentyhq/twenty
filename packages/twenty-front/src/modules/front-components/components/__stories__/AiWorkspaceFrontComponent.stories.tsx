import { type Meta, type StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { AiWorkspaceFrontComponent } from '@/front-components/components/AiWorkspaceFrontComponent';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const meta: Meta<typeof AiWorkspaceFrontComponent> = {
  title: 'Modules/FrontComponents/AiWorkspaceFrontComponent',
  component: AiWorkspaceFrontComponent,
  decorators: [RootDecorator, ToastDecorator, ComponentDecorator],
  args: { frontComponentId: 'f63b3106-066a-4b29-913f-570308b6e999' },
};

export default meta;
type Story = StoryObj<typeof AiWorkspaceFrontComponent>;

export const ViewerData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get('*/rest/ai-front-components/:id/runtime', () =>
          HttpResponse.json({
            applicationId: 'workspace-application',
            componentSource: `export default function render(container, props) {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Visible records: ' + props.records.length;
        container.appendChild(paragraph);
      }`,
            data: { records: [{ id: 'visible-record' }] },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Visible records: 1',
        {},
        { timeout: 15000 },
      ),
    ).toBeVisible();
  },
};

export const AccessDenied: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          '*/rest/ai-front-components/:id/runtime',
          () => new HttpResponse(null, { status: 403 }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Could not load this component or its data.');
  },
};
