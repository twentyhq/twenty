import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { buildFrontComponentStorageNamespace } from '@/host/utils/buildFrontComponentStorageNamespace';
import { clearFrontComponentStorage } from '@/host/utils/clearFrontComponentStorage';
import { deleteFrontComponentStorageItem } from '@/host/utils/deleteFrontComponentStorageItem';
import { setFrontComponentStorageItem } from '@/host/utils/setFrontComponentStorageItem';
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

const PERSISTED_STORAGE_NAMESPACE = buildFrontComponentStorageNamespace({
  applicationId: 'story-application-id',
  userId: 'story-user-id',
});

const meta: Meta<typeof FrontComponentRenderer> = {
  title: 'FrontComponent/HostApi/Storage',
  component: FrontComponentRenderer,
  parameters: { layout: 'centered' },
  args: FRONT_COMPONENT_STORY_DEFAULT_ARGS,
  beforeEach: resetFrontComponentStoryMocks,
};

export default meta;

type Story = StoryObj<typeof FrontComponentRenderer>;

const roundTripStory = runFrontComponentStory({
  frontComponentBundleName: 'host-api-storage',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('subject'));

    expect(
      await canvas.findByText(
        'storage:local:hello:greeting:1:0',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();

    await userEvent.click(await canvas.findByTestId('local-storage-write'));
    await userEvent.click(await canvas.findByTestId('session-storage'));

    await waitFor(
      () => {
        expect(
          window.localStorage.getItem(`${PERSISTED_STORAGE_NAMESPACE}greeting`),
        ).toBeNull();
        expect(
          window.localStorage.getItem(`${PERSISTED_STORAGE_NAMESPACE}theme`),
        ).toBe('dark');
        expect(
          window.sessionStorage.getItem(`${PERSISTED_STORAGE_NAMESPACE}visits`),
        ).toBe('2');
      },
      { timeout: HOST_API_TIMEOUT },
    );
  },
});

const clearPersistedStorageNamespace = () => {
  for (const storageType of ['localStorage', 'sessionStorage'] as const) {
    clearFrontComponentStorage({
      namespace: PERSISTED_STORAGE_NAMESPACE,
      storageType,
    });
  }
};

export const StorageRoundTrip: Story = {
  ...roundTripStory,
  beforeEach: () => {
    clearPersistedStorageNamespace();

    return clearPersistedStorageNamespace;
  },
  args: {
    ...roundTripStory.args,
    storageNamespace: PERSISTED_STORAGE_NAMESPACE,
    frontComponentHostCommunicationApi: {
      ...hostApiMocks,
      storageSet: async ({ storageType, key, serializedValue }) => {
        setFrontComponentStorageItem({
          namespace: PERSISTED_STORAGE_NAMESPACE,
          storageType,
          key,
          serializedValue,
        });
      },
      storageDelete: async ({ storageType, key }) => {
        deleteFrontComponentStorageItem({
          namespace: PERSISTED_STORAGE_NAMESPACE,
          storageType,
          key,
        });
      },
      storageClear: async ({ storageType }) => {
        clearFrontComponentStorage({
          namespace: PERSISTED_STORAGE_NAMESPACE,
          storageType,
        });
      },
    },
  },
};

export const StorageValueTooLarge: Story = runFrontComponentStory({
  frontComponentBundleName: 'host-api-storage',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectFrontComponentMounted(canvas);

    await userEvent.click(await canvas.findByTestId('oversized'));

    expect(
      await canvas.findByText(
        'storage:error:QuotaExceededError',
        {},
        { timeout: INTERACTION_TIMEOUT },
      ),
    ).toBeVisible();
  },
});
