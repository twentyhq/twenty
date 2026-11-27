import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatFrontComponent } from '@/metadata-store/types/FlatFrontComponent';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { delay, graphql, http, HttpResponse } from 'msw';
import { expect, fn, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const FRONT_COMPONENT_ID = 'front-component-renderer-story-front-component';
const APPLICATION_ID = 'front-component-renderer-story-application';
const FAILING_APPLICATION_ID =
  'front-component-renderer-story-failing-application';
const ACCESS_TOKEN = 'story-access-token';

const findOneQueryRequested = fn();
const applicationTokenRequested = fn();
const componentSourceRequested = fn();

const buildFlatFrontComponent = (
  applicationId: string,
): FlatFrontComponent => ({
  __typename: 'FrontComponent',
  id: FRONT_COMPONENT_ID,
  name: 'Story front component',
  applicationId,
  builtComponentChecksum: 'story-checksum',
  builtComponentPath: 'story-front-component.mjs',
  componentName: 'StoryFrontComponent',
  sourceComponentPath: 'story-front-component.tsx',
  isHeadless: false,
  usesSdkClient: false,
  widgetAvailability: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const setFrontComponentInMetadataStore = (applicationId: string) => {
  jotaiStore.set(metadataStoreState.atomFamily('frontComponents'), {
    current: [buildFlatFrontComponent(applicationId)],
    draft: [],
    status: 'up-to-date',
  });
};

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'Modules/FrontComponents/FrontComponentRenderer',
  component: FrontComponentRenderer,
  decorators: [RootDecorator, ToastDecorator, ComponentDecorator],
  beforeEach: () => {
    findOneQueryRequested.mockClear();
    applicationTokenRequested.mockClear();
    componentSourceRequested.mockClear();
  },
  args: {
    frontComponentId: FRONT_COMPONENT_ID,
    loadingFallback: 'Loading front component',
    unavailableFallback: 'Front component unavailable',
  },
  parameters: {
    msw: {
      handlers: [
        graphql.query('FindOneFrontComponent', async () => {
          findOneQueryRequested();

          await delay('infinite');
        }),
        graphql.mutation(
          'GenerateFrontComponentApplicationTokenPair',
          ({ variables }) => {
            applicationTokenRequested(variables.applicationId);

            if (variables.applicationId === FAILING_APPLICATION_ID) {
              return HttpResponse.json({
                errors: [{ message: 'Application token unavailable' }],
              });
            }

            return HttpResponse.json({
              data: {
                generateFrontComponentApplicationTokenPair: {
                  __typename: 'ApplicationTokenPair',
                  applicationAccessToken: {
                    __typename: 'AuthToken',
                    token: ACCESS_TOKEN,
                    expiresAt: '2099-01-01T00:00:00.000Z',
                  },
                  applicationRefreshToken: {
                    __typename: 'AuthToken',
                    token: 'story-refresh-token',
                    expiresAt: '2099-01-01T00:00:00.000Z',
                  },
                },
              },
            });
          },
        ),
        http.get(
          `${REST_API_BASE_URL}/front-components/${FRONT_COMPONENT_ID}/:fileName`,
          ({ request }) => {
            componentSourceRequested(request.headers.get('authorization'));

            return new HttpResponse('export default () => {};', {
              headers: { 'Content-Type': 'application/javascript' },
            });
          },
        ),
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof FrontComponentRenderer>;

export const PreloadsSourcesWhileFindOneQueryIsPending: Story = {
  beforeEach: () => {
    setFrontComponentInMetadataStore(APPLICATION_ID);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(componentSourceRequested).toHaveBeenCalledWith(
        `Bearer ${ACCESS_TOKEN}`,
      ),
    );
    await expect(findOneQueryRequested).toHaveBeenCalled();
    await expect(canvas.getByText('Loading front component')).toBeVisible();
  },
};

export const WaitsForFindOneQueryWhenMissingFromMetadataStore: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(findOneQueryRequested).toHaveBeenCalled());
    await expect(canvas.getByText('Loading front component')).toBeVisible();
    await expect(applicationTokenRequested).not.toHaveBeenCalled();
    await expect(componentSourceRequested).not.toHaveBeenCalled();
  },
};

export const ShowsUnavailableFallbackWhenTokenFails: Story = {
  beforeEach: () => {
    setFrontComponentInMetadataStore(FAILING_APPLICATION_ID);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Front component unavailable'),
    ).toBeVisible();
    await expect(componentSourceRequested).not.toHaveBeenCalled();
  },
};
