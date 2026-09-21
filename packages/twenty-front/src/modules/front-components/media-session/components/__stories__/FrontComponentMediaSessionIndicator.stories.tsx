import { FrontComponentMediaSessionIndicator } from '@/front-components/media-session/components/FrontComponentMediaSessionIndicator';
import { frontComponentMediaSessionsState } from '@/front-components/media-session/states/frontComponentMediaSessionsState';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type FrontComponentMediaSessionStatus } from '@/front-components/media-session/types/FrontComponentMediaSessionStatus';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof FrontComponentMediaSessionIndicator> = {
  title: 'Modules/FrontComponents/FrontComponentMediaSessionIndicator',
  component: FrontComponentMediaSessionIndicator,
  decorators: [ComponentDecorator],
};

export default meta;

const MediaSessionIndicatorPreview = ({
  isPending,
}: {
  isPending: boolean;
}) => {
  const [store] = useState(() => {
    const previewStore = createStore();

    previewStore.set(frontComponentMediaSessionsState.atom, [
      {
        id: 'recorder',
        applicationId: 'recorder',
        applicationName: 'Call recorder',
        activeMediaTypes: isPending ? [] : ['audio', 'video'],
        pendingMediaTypes: isPending ? ['audio', 'video'] : [],
        onStop: fn(),
      },
    ]);

    return previewStore;
  });

  return (
    <Provider store={store}>
      <FrontComponentMediaSessionIndicator />
    </Provider>
  );
};

export const CircularIndicators: StoryObj<
  typeof FrontComponentMediaSessionIndicator
> = {
  render: () => (
    <>
      <MediaSessionIndicatorPreview isPending={false} />
      <MediaSessionIndicatorPreview isPending />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Apps recording', 'Recording requests']) {
      const trigger = canvas.getByRole('button', { name });
      const dot = trigger.querySelector('span[aria-hidden]');

      if (!isDefined(dot)) {
        throw new Error(`Missing recording indicator for ${name}`);
      }

      const dotStyle = getComputedStyle(dot);

      await expect(dotStyle.width).toBe(dotStyle.height);
      await expect(dotStyle.borderRadius).toBe('50%');

      if (CSS.supports('corner-shape', 'round')) {
        await expect(['round', 'superellipse(1)']).toContain(
          dotStyle.getPropertyValue('corner-shape'),
        );
      }
    }
  },
};

const StoredSessionsIndicator = ({
  sessions,
}: {
  sessions: FrontComponentMediaSessionStatus[];
}) => {
  const [store] = useState(() => {
    const previewStore = createStore();

    previewStore.set(frontComponentMediaSessionsState.atom, sessions);

    return previewStore;
  });

  return (
    <Provider store={store}>
      <FrontComponentMediaSessionIndicator />
    </Provider>
  );
};

const recorderSession: FrontComponentMediaSessionStatus = {
  id: 'recorder-audio',
  applicationId: 'recorder',
  applicationName: 'Recorder',
  activeMediaTypes: ['audio'],
  pendingMediaTypes: [],
  onStop: fn(),
};

export const Hidden: StoryObj<typeof FrontComponentMediaSessionIndicator> = {
  render: () => <StoredSessionsIndicator sessions={[]} />,
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('button'),
    ).not.toBeInTheDocument();
  },
};

export const OneRowPerApplication: StoryObj<
  typeof FrontComponentMediaSessionIndicator
> = {
  render: () => {
    const stopRecorderAudio = fn();
    const stopRecorderVideo = fn();
    const stopCameraApp = fn();

    return (
      <StoredSessionsIndicator
        sessions={[
          { ...recorderSession, onStop: stopRecorderAudio },
          {
            ...recorderSession,
            id: 'recorder-video',
            activeMediaTypes: ['video'],
            onStop: stopRecorderVideo,
          },
          {
            ...recorderSession,
            id: 'camera-session',
            applicationId: 'camera-app',
            applicationName: 'Camera app',
            activeMediaTypes: ['video'],
            onStop: stopCameraApp,
          },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText('Recorder')).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Apps recording' }),
    );

    const applications = await screen.findByRole('list', {
      name: 'Apps recording',
    });
    const applicationsCanvas = within(applications);

    await expect(applicationsCanvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(applicationsCanvas.getAllByText('Recorder')).toHaveLength(1);
    await expect(
      applicationsCanvas.getByText('Microphone and camera'),
    ).toBeVisible();
    await expect(applicationsCanvas.getByText('Camera app')).toBeVisible();
    await expect(applicationsCanvas.getByText('Camera')).toBeVisible();
  },
};

export const PendingRequest: StoryObj<
  typeof FrontComponentMediaSessionIndicator
> = {
  render: () => (
    <StoredSessionsIndicator
      sessions={[
        {
          ...recorderSession,
          activeMediaTypes: [],
          pendingMediaTypes: ['audio'],
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByRole('button', { name: 'Apps recording' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Recording requests' }),
    );

    await expect(
      await screen.findByText('Waiting for permission'),
    ).toBeVisible();
    await expect(
      screen.getByRole('button', { name: 'Cancel recording for Recorder' }),
    ).toBeVisible();
  },
};

export const ClosesWithEscape: StoryObj<
  typeof FrontComponentMediaSessionIndicator
> = {
  render: () => <StoredSessionsIndicator sessions={[recorderSession]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Apps recording' }),
    );
    await screen.findByRole('list', { name: 'Apps recording' });
    await userEvent.keyboard('{Escape}');

    await waitFor(async () => {
      await expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  },
};
