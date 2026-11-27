import { REST_API_BASE_URL } from '@/apollo/constants/RestApiBaseUrl';
import { FrontComponentRendererPrerequisitesLoader } from '@/front-components/components/FrontComponentRendererPrerequisitesLoader';
import { useFrontComponentRendererPrerequisitesOrThrow } from '@/front-components/contexts/FrontComponentRendererPrerequisitesContext';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { type ResolvedFrontComponent } from '@/front-components/types/ResolvedFrontComponent';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, http, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const FRONT_COMPONENT_ID = 'prerequisites-loader-story-front-component';
const APPLICATION_ID = 'prerequisites-loader-story-application';
const FAILING_APPLICATION_ID = 'prerequisites-loader-story-failing-application';
const ACCESS_TOKEN = 'story-access-token';

const componentSourceRequested = fn();

const buildStoryFrontComponent = (
  applicationId: string,
): ResolvedFrontComponent => ({
  __typename: 'FrontComponent',
  id: FRONT_COMPONENT_ID,
  name: 'Story front component',
  applicationId,
  applicationName: 'Story application',
  applicationFunctionsBaseUrl: null,
  applicationGrantedCapabilities: null,
  builtComponentChecksum: 'story-checksum',
  isHeadless: false,
  usesSdkClient: false,
  frontComponentSharedDependenciesChecksum: null,
  applicationVariables: {},
  applicationGrantedIframeMediaPermissions: null,
});

const LoadedPrerequisites = () => {
  const { applicationAccessToken, preloadedSourcesPromise } =
    useFrontComponentRendererPrerequisitesOrThrow();

  return (
    <div>
      {isDefined(preloadedSourcesPromise)
        ? `${applicationAccessToken} with preloaded sources`
        : `${applicationAccessToken} without preloaded sources`}
    </div>
  );
};

type PrerequisitesLoaderStoryProps = {
  applicationId: string;
};

const PrerequisitesLoaderStory = ({
  applicationId,
}: PrerequisitesLoaderStoryProps) => {
  const [hasFindOneQueryAnswered, setHasFindOneQueryAnswered] = useState(false);

  const storyFrontComponent = buildStoryFrontComponent(applicationId);

  return (
    <FrontComponentInstanceContext.Provider
      value={{ instanceId: `${FRONT_COMPONENT_ID}-${applicationId}` }}
    >
      <button type="button" onClick={() => setHasFindOneQueryAnswered(true)}>
        Answer find-one query
      </button>
      <FrontComponentRendererPrerequisitesLoader
        frontComponentFieldsNeededToStartLoading={storyFrontComponent}
        frontComponentFromFindOneQuery={
          hasFindOneQueryAnswered ? storyFrontComponent : undefined
        }
        loadingFallback="Loading front component"
        unavailableFallback="Front component unavailable"
      >
        <LoadedPrerequisites />
      </FrontComponentRendererPrerequisitesLoader>
    </FrontComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof PrerequisitesLoaderStory> = {
  title: 'Modules/FrontComponents/FrontComponentRendererPrerequisitesLoader',
  component: PrerequisitesLoaderStory,
  decorators: [RootDecorator, ToastDecorator, ComponentDecorator],
  beforeEach: () => {
    componentSourceRequested.mockClear();
  },
  args: { applicationId: APPLICATION_ID },
  parameters: {
    msw: {
      handlers: [
        graphql.mutation(
          'GenerateFrontComponentApplicationTokenPair',
          ({ variables }) =>
            variables.applicationId === FAILING_APPLICATION_ID
              ? HttpResponse.json({
                  errors: [{ message: 'Application token unavailable' }],
                })
              : HttpResponse.json({
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
                }),
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
type Story = StoryObj<typeof PrerequisitesLoaderStory>;

export const PreloadsSourcesBeforeFindOneQueryAnswers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(componentSourceRequested).toHaveBeenCalledWith(
        `Bearer ${ACCESS_TOKEN}`,
      ),
    );
    await expect(canvas.getByText('Loading front component')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Answer find-one query' }),
    );

    await expect(
      await canvas.findByText(`${ACCESS_TOKEN} with preloaded sources`),
    ).toBeVisible();
    await expect(componentSourceRequested).toHaveBeenCalledTimes(1);
  },
};

export const ShowsUnavailableFallbackWhenTokenFails: Story = {
  args: { applicationId: FAILING_APPLICATION_ID },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByText('Front component unavailable'),
    ).toBeVisible();
    await expect(componentSourceRequested).not.toHaveBeenCalled();
  },
};
