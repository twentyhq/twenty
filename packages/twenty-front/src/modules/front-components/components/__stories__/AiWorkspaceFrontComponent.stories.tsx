import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, http, HttpResponse } from 'msw';
import { expect, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { AiWorkspaceFrontComponent } from '@/front-components/components/AiWorkspaceFrontComponent';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const APPLICATION_ID = 'd0872f22-6470-48d6-afdb-bb8e143e56ea';
const APPLICATION_ACCESS_TOKEN = 'component-application-token';
const SHARED_DEPENDENCIES_SOURCE = "export const label = 'Visible records: ';";
const SHARED_DEPENDENCIES_CHECKSUM =
  '9ecb73aa1c9807936b7167777d5178f0c74386e4b0a3f66625be84dc13004f6d';

const COMPONENT_SOURCE = `// twenty-ai-shared-dependencies: 9ecb73aa1c9807936b7167777d5178f0c74386e4b0a3f66625be84dc13004f6d
import { label } from 'twenty:front-component-shared-dependencies';
      export default function render(container, props) {
        if (globalThis.process?.env?.TWENTY_APP_ACCESS_TOKEN || JSON.stringify(props).includes('component-application-token')) {
          throw new Error('Credential exposed to component');
        }
        const paragraph = document.createElement('p');
        paragraph.textContent = label + props.records.length;
        container.appendChild(paragraph);
      }`;
const COMPONENT_CHECKSUM =
  '85a6c123834c5169e60f10b335c83d854b1ba0cf53261a423fcd922d90476abd';

const meta: Meta<typeof AiWorkspaceFrontComponent> = {
  title: 'Modules/FrontComponents/AiWorkspaceFrontComponent',
  component: AiWorkspaceFrontComponent,
  decorators: [RootDecorator, ToastDecorator, ComponentDecorator],
  args: {
    frontComponentId: 'f63b3106-066a-4b29-913f-570308b6e999',
    applicationId: APPLICATION_ID,
  },
  parameters: {
    msw: {
      handlers: {
        token: graphql.mutation(
          'GenerateFrontComponentApplicationTokenPair',
          ({ variables }) => {
            expect(variables.applicationId).toBe(APPLICATION_ID);
            return HttpResponse.json({
              data: {
                generateFrontComponentApplicationTokenPair: {
                  __typename: 'ApplicationTokenPair',
                  applicationAccessToken: {
                    __typename: 'AuthToken',
                    token: APPLICATION_ACCESS_TOKEN,
                    expiresAt: '2099-01-01T00:00:00.000Z',
                  },
                  applicationRefreshToken: {
                    __typename: 'AuthToken',
                    token: 'component-refresh-token',
                    expiresAt: '2099-01-01T00:00:00.000Z',
                  },
                },
              },
            });
          },
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof AiWorkspaceFrontComponent>;

export const ViewerData: Story = {
  parameters: {
    msw: {
      handlers: {
        runtime: http.get(
          '*/rest/ai-front-components/:id/runtime',
          ({ request }) => {
            expect(request.headers.get('Authorization')).toBe(
              `Bearer ${APPLICATION_ACCESS_TOKEN}`,
            );
            return HttpResponse.json({
              applicationId: APPLICATION_ID,
              sharedDependenciesChecksum: 'a'.repeat(64),
              builtComponentChecksum: COMPONENT_CHECKSUM,
              data: { records: [{ id: 'visible-record' }] },
            });
          },
        ),
        component: http.get(
          '*/rest/front-components/:id/:checksum',
          ({ request, params }) => {
            expect(params.checksum).toBe(`${COMPONENT_CHECKSUM}.js`);
            expect(request.headers.get('Authorization')).toBe(
              `Bearer ${APPLICATION_ACCESS_TOKEN}`,
            );
            return new HttpResponse(COMPONENT_SOURCE, {
              headers: { 'Content-Type': 'text/javascript' },
            });
          },
        ),
        bundle: http.get(
          '*/rest/front-component-shared-dependencies/bundles/:applicationId/:checksum',
          ({ request, params }) => {
            expect(params.applicationId).toBe(APPLICATION_ID);
            expect(params.checksum).toBe(`${SHARED_DEPENDENCIES_CHECKSUM}.js`);
            expect(request.headers.get('Authorization')).toBe(
              `Bearer ${APPLICATION_ACCESS_TOKEN}`,
            );
            return new HttpResponse(SHARED_DEPENDENCIES_SOURCE, {
              headers: { 'Content-Type': 'text/javascript' },
            });
          },
        ),
      },
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
      handlers: {
        runtime: http.get(
          '*/rest/ai-front-components/:id/runtime',
          () => new HttpResponse(null, { status: 403 }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Could not load this component or its data.');
  },
};

export const CorruptComponentSource: Story = {
  args: { frontComponentId: '273eceb2-019c-4aa4-913e-e36f003e4ea7' },
  parameters: {
    msw: {
      handlers: {
        runtime: http.get('*/rest/ai-front-components/:id/runtime', () =>
          HttpResponse.json({
            applicationId: APPLICATION_ID,
            builtComponentChecksum: 'c'.repeat(64),
            data: { records: [] },
          }),
        ),
        component: http.get(
          '*/rest/front-components/:id/:checksum',
          () =>
            new HttpResponse(COMPONENT_SOURCE, {
              headers: { 'Content-Type': 'text/javascript' },
            }),
        ),
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('alert'),
    ).toHaveTextContent('Front component source checksum mismatch');
    expect(
      within(canvasElement).queryByText('Visible records: 0'),
    ).not.toBeInTheDocument();
  },
};

export const FromMetadata: Story = {
  ...ViewerData,
  render: ({ frontComponentId }) => (
    <FrontComponentRenderer frontComponentId={frontComponentId} />
  ),
  parameters: {
    msw: {
      handlers: {
        ...ViewerData.parameters?.msw.handlers,
        metadata: graphql.query('FindOneFrontComponent', ({ variables }) =>
          HttpResponse.json({
            data: {
              frontComponent: {
                __typename: 'FrontComponent',
                id: variables.id,
                name: 'AI component',
                applicationId: APPLICATION_ID,
                applicationName: 'Workspace',
                applicationGrantedCapabilities: [],
                builtComponentChecksum: COMPONENT_CHECKSUM,
                sourceComponentPath: 'src/renamed-component.tsx',
                isAiComponent: true,
                isHeadless: false,
                usesSdkClient: false,
                frontComponentSharedDependenciesChecksum:
                  SHARED_DEPENDENCIES_CHECKSUM,
                applicationVariables: {},
              },
            },
          }),
        ),
      },
    },
  },
};
