import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { frontComponentLocalStorageService } from '@/host/utils/frontComponentLocalStorageService';
import {
  FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  hostApiMocks,
  resetFrontComponentStoryMocks,
} from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
import {
  HOST_API_TIMEOUT,
  INTERACTION_TIMEOUT,
} from '@/__stories__/shared/test-utils/timeouts';

const PERSISTED_STORAGE_NAMESPACE = {
  applicationId: 'story-application-id',
  userId: 'story-user-id',
};

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/LocalStorage',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

export const LocalStorageRoundTrip: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-local-storage',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi;

    if (!isDefined(api)) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('subject'));

    await waitFor(
      () => {
        expect(api.localStorageSet).toHaveBeenCalledWith(
          'greeting',
          '{"hello":"world"}',
        );
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'storage:success:world:greeting:true',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});

export const LocalStorageSharedWithGlobalShim: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-local-storage',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const api = args.frontComponentHostCommunicationApi;

    if (!isDefined(api)) {
      throw new Error('frontComponentHostCommunicationApi is required');
    }

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('global-storage'));

    await waitFor(
      () => {
        expect(api.localStorageSet).toHaveBeenCalledWith(
          'from-dependency',
          '"raw"',
        );
      },
      { timeout: HOST_API_TIMEOUT },
    );

    expect(
      await canvas.findByText(
        'storage:shared:raw',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});

export const LocalStorageValueTooLarge: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-local-storage',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('oversized'));

    expect(
      await canvas.findByText(
        'storage:error:FRONT_COMPONENT_STORAGE_VALUE_TOO_LARGE',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});

const persistedStory = runFrontComponentStory({
  frontComponentBundleName: 'host-api-local-storage',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('global-storage'));

    await waitFor(
      async () => {
        expect(
          await frontComponentLocalStorageService.snapshot(
            PERSISTED_STORAGE_NAMESPACE,
          ),
        ).toEqual({ 'from-dependency': '"raw"' });
      },
      { timeout: HOST_API_TIMEOUT },
    );

    await frontComponentLocalStorageService.clear(PERSISTED_STORAGE_NAMESPACE);
  },
});

export const LocalStoragePersistsToIndexedDb: Story = {
  ...persistedStory,
  args: {
    ...persistedStory.args,
    localStorageNamespace: PERSISTED_STORAGE_NAMESPACE,
    frontComponentHostCommunicationApi: {
      ...hostApiMocks,
      localStorageSet: (key: string, serializedValue: string) =>
        frontComponentLocalStorageService.set({
          ...PERSISTED_STORAGE_NAMESPACE,
          key,
          serializedValue,
        }),
      localStorageDelete: (key: string) =>
        frontComponentLocalStorageService.delete({
          ...PERSISTED_STORAGE_NAMESPACE,
          key,
        }),
      localStorageClear: () =>
        frontComponentLocalStorageService.clear(PERSISTED_STORAGE_NAMESPACE),
    },
  },
};
